from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Dict, Any, Optional
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
import logging
from datetime import datetime

from application.services.session_service import session_service
from application.services.ai_service import ai_service
from application.services.max_mode_service import max_mode_service, MaxModeCapability
from infrastructure.mcp_server import mcp_server

router = APIRouter()

# Request and response models
class MessageRequest(BaseModel):
    message: str
    timestamp: Optional[float] = None
    event_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ToolInvocationRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]

class MaxModeRequest(BaseModel):
    capabilities: List[str]
    task_description: Optional[str] = None

class LargeFileRequest(BaseModel):
    file_path: str
    max_lines: Optional[int] = None

class ApiResponse(BaseModel):
    code: int = 0
    msg: str = "success"
    data: Optional[Dict[str, Any]] = None

# Session management endpoints
@router.put("/sessions", response_model=ApiResponse)
async def create_session():
    """Create a new conversation session"""
    session = session_service.create_session()
    return ApiResponse(data={"session_id": session.id})

@router.get("/sessions/{session_id}", response_model=ApiResponse)
async def get_session(session_id: str):
    """Get session information including conversation history"""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return ApiResponse(data={
        "session_id": session.id,
        "title": session.title,
        "events": session.events
    })

@router.get("/sessions", response_model=ApiResponse)
async def list_sessions():
    """Get list of all sessions"""
    sessions = session_service.list_sessions()
    return ApiResponse(data={"sessions": sessions})

@router.delete("/sessions/{session_id}", response_model=ApiResponse)
async def delete_session(session_id: str):
    """Delete a session"""
    success = session_service.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return ApiResponse()

@router.post("/sessions/{session_id}/stop", response_model=ApiResponse)
async def stop_session(session_id: str):
    """Stop an active session"""
    success = session_service.stop_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Clean up any MCP processes associated with this session
    session = session_service.get_session(session_id)
    if session and session.mcp_processes:
        for process_id in session.mcp_processes.values():
            try:
                mcp_server.stop_server(process_id)
            except ValueError:
                pass  # Process already stopped
    
    return ApiResponse()

# AI Service management endpoints
@router.post("/ai/initialize", response_model=ApiResponse)
async def initialize_ai_service(api_key: str, provider: str = "openai"):
    """Initialize the AI service with API credentials"""
    try:
        ai_service.initialize_client(api_key, provider)
        return ApiResponse(data={"status": "initialized", "provider": provider})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to initialize AI service: {str(e)}")

@router.get("/ai/models", response_model=ApiResponse)
async def list_ai_models():
    """List available AI models and their capabilities"""
    models = ai_service.list_available_models()
    return ApiResponse(data={"models": models})

@router.get("/ai/models/{model_name}", response_model=ApiResponse)
async def get_model_info(model_name: str):
    """Get detailed information about a specific AI model"""
    model_info = ai_service.get_model_info(model_name)
    if not model_info:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return ApiResponse(data={
        "name": model_info.name,
        "provider": model_info.provider,
        "max_tokens": model_info.max_tokens,
        "cost_per_1k_tokens": model_info.cost_per_1k_tokens,
        "speed_rating": model_info.speed_rating,
        "capability_rating": model_info.capability_rating,
        "context_window": model_info.context_window
    })

# Tool discovery and management endpoints
@router.get("/tools", response_model=ApiResponse)
async def list_available_tools(category: Optional[str] = None):
    """List all available tools, optionally filtered by category"""
    tools = mcp_server.get_available_tools(category)
    return ApiResponse(data={"tools": tools})

@router.get("/tools/{tool_name}", response_model=ApiResponse)
async def get_tool_info(tool_name: str):
    """Get detailed information about a specific tool"""
    tool_info = mcp_server.get_tool_info(tool_name)
    if not tool_info:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    return ApiResponse(data=tool_info)

@router.get("/mcp/servers", response_model=ApiResponse)
async def list_mcp_servers():
    """List all MCP servers and their status"""
    server_status = mcp_server.get_all_server_status()
    return ApiResponse(data={"servers": server_status})

@router.post("/mcp/servers/{server_name}/start", response_model=ApiResponse)
async def start_mcp_server(server_name: str):
    """Start a specific MCP server"""
    try:
        process_id = mcp_server.start_server(server_name)
        return ApiResponse(data={"process_id": process_id, "server_name": server_name})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start MCP server: {str(e)}")

@router.post("/mcp/servers/{process_id}/stop", response_model=ApiResponse)
async def stop_mcp_server(process_id: str):
    """Stop a specific MCP server process"""
    try:
        mcp_server.stop_server(process_id)
        return ApiResponse(data={"status": "stopped"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop MCP server: {str(e)}")

# Chat and tool invocation endpoints
@router.post("/sessions/{session_id}/chat")
async def chat_with_session(session_id: str, request: MessageRequest):
    """Send a message to the session and receive streaming response with AI integration"""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Add user message to session
    session_service.add_message(session_id, request.message, "user", request.event_id)
    
    # Add to AI conversation history
    ai_service.add_to_history(session_id, "user", request.message)
    
    async def event_generator():
        try:
            # Send initial processing event
            yield {
                "event": "processing",
                "data": json.dumps({"status": "analyzing_request"})
            }
            
            # Generate AI response with streaming
            full_response = ""
            async for ai_chunk in ai_service.generate_response(session_id, request.message, request.context):
                if ai_chunk["type"] == "model_selected":
                    yield {
                        "event": "model_selected",
                        "data": json.dumps(ai_chunk)
                    }
                elif ai_chunk["type"] == "content":
                    full_response += ai_chunk["content"]
                    yield {
                        "event": "message",
                        "data": json.dumps({"content": ai_chunk["content"]})
                    }
                elif ai_chunk["type"] == "complete":
                    # Add assistant response to session
                    session_service.add_message(session_id, full_response, "assistant")
                    ai_service.add_to_history(session_id, "assistant", full_response)
                    
                    yield {
                        "event": "complete",
                        "data": json.dumps({
                            "full_content": full_response,
                            "tokens_used": ai_chunk.get("tokens_used", 0)
                        })
                    }
                elif ai_chunk["type"] == "error":
                    yield {
                        "event": "error",
                        "data": json.dumps({"error": ai_chunk["content"]})
                    }
            
            # Check if the response suggests tool usage
            if any(keyword in full_response.lower() for keyword in ["browser", "click", "navigate", "screenshot", "automate"]):
                # Start Playwright MCP server if not already started
                if "playwright" not in session.mcp_processes:
                    try:
                        process_id = mcp_server.start_server("playwright")
                        session.mcp_processes["playwright"] = process_id
                        
                        yield {
                            "event": "tool_server_started",
                            "data": json.dumps({
                                "server": "playwright",
                                "process_id": process_id
                            })
                        }
                    except Exception as e:
                        yield {
                            "event": "tool_error",
                            "data": json.dumps({"error": f"Failed to start Playwright server: {str(e)}"})
                        }
            
            # Send done event
            yield {
                "event": "done",
                "data": json.dumps({"message_id": f"msg_{datetime.now().timestamp()}"})
            }
            
        except Exception as e:
            logger.error(f"Error in chat session {session_id}: {e}")
            yield {
                "event": "error",
                "data": json.dumps({"error": f"Chat processing failed: {str(e)}"})
            }
    
    return EventSourceResponse(event_generator())

# Tool invocation endpoint
@router.post("/sessions/{session_id}/tools/{tool_name}", response_model=ApiResponse)
async def invoke_tool(session_id: str, tool_name: str, request: ToolInvocationRequest):
    """Invoke a tool in the session with enhanced error handling"""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get tool information
    tool_info = mcp_server.get_tool_info(tool_name)
    if not tool_info:
        raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
    
    server_type = tool_info["server"]
    
    # Start MCP server if not already started
    if server_type not in session.mcp_processes:
        try:
            process_id = mcp_server.start_server(server_type)
            session.mcp_processes[server_type] = process_id
            logger.info(f"Started {server_type} MCP server for session {session_id}")
        except Exception as e:
            logger.error(f"Failed to start MCP server {server_type}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to start MCP server: {str(e)}")
    
    # Invoke tool asynchronously
    try:
        result = await mcp_server.invoke_tool_async(
            session.mcp_processes[server_type], 
            tool_name, 
            request.parameters
        )
        
        # Add tool event to session
        session_service.add_tool_event(session_id, tool_name, request.parameters, result)
        
        return ApiResponse(data={
            "tool_name": tool_name,
            "parameters": request.parameters,
            "result": result,
            "invoked_at": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Tool invocation failed for {tool_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Tool invocation failed: {str(e)}")

# Additional utility endpoints
@router.get("/sessions/{session_id}/history", response_model=ApiResponse)
async def get_session_history(session_id: str):
    """Get conversation history for a session"""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return ApiResponse(data={
        "session_id": session_id,
        "events": session.events,
        "total_events": len(session.events)
    })

@router.delete("/sessions/{session_id}/history", response_model=ApiResponse)
async def clear_session_history(session_id: str):
    """Clear conversation history for a session"""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.events = []
    ai_service.clear_history(session_id)
    
    return ApiResponse(data={"status": "history_cleared"})

# Max Mode endpoints
@router.post("/sessions/{session_id}/max-mode/enable", response_model=ApiResponse)
async def enable_max_mode(session_id: str, request: MaxModeRequest):
    """Enable Max Mode for a session with specified capabilities"""
    try:
        # Convert string capabilities to enum values
        capabilities = []
        for cap_str in request.capabilities:
            try:
                capabilities.append(MaxModeCapability(cap_str))
            except ValueError:
                logger.warning(f"Unknown Max Mode capability: {cap_str}")
        
        if not capabilities:
            raise HTTPException(status_code=400, detail="No valid capabilities provided")
        
        result = await max_mode_service.enable_max_mode(session_id, capabilities)
        return ApiResponse(data=result)
    except Exception as e:
        logger.error(f"Failed to enable Max Mode: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to enable Max Mode: {str(e)}")

@router.post("/sessions/{session_id}/max-mode/disable", response_model=ApiResponse)
async def disable_max_mode(session_id: str):
    """Disable Max Mode for a session"""
    try:
        result = await max_mode_service.disable_max_mode(session_id)
        return ApiResponse(data=result)
    except Exception as e:
        logger.error(f"Failed to disable Max Mode: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to disable Max Mode: {str(e)}")

@router.get("/sessions/{session_id}/max-mode/status", response_model=ApiResponse)
async def get_max_mode_status(session_id: str):
    """Get Max Mode status for a session"""
    try:
        status = max_mode_service.get_max_mode_status(session_id)
        return ApiResponse(data=status)
    except Exception as e:
        logger.error(f"Failed to get Max Mode status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get Max Mode status: {str(e)}")

@router.post("/sessions/{session_id}/max-mode/process-large-context")
async def process_large_context(session_id: str, content: str, content_type: str = "mixed"):
    """Process large context content for Max Mode"""
    try:
        chunks = await max_mode_service.process_large_context(session_id, content, content_type)
        return ApiResponse(data={
            "session_id": session_id,
            "chunks_created": len(chunks),
            "total_tokens": sum(chunk.token_count for chunk in chunks),
            "chunks": [
                {
                    "id": chunk.id,
                    "token_count": chunk.token_count,
                    "chunk_type": chunk.chunk_type,
                    "priority": chunk.priority,
                    "metadata": chunk.metadata
                }
                for chunk in chunks
            ]
        })
    except Exception as e:
        logger.error(f"Failed to process large context: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process large context: {str(e)}")

@router.post("/sessions/{session_id}/max-mode/create-tool-plan")
async def create_tool_orchestration_plan(session_id: str, task_description: str):
    """Create a tool orchestration plan for complex tasks"""
    try:
        plans = await max_mode_service.create_tool_orchestration_plan(session_id, task_description)
        return ApiResponse(data={
            "session_id": session_id,
            "task_description": task_description,
            "total_tools": len(plans),
            "estimated_duration": sum(plan.estimated_duration for plan in plans),
            "plans": [
                {
                    "tool_name": plan.tool_name,
                    "parameters": plan.parameters,
                    "dependencies": plan.dependencies,
                    "priority": plan.priority,
                    "estimated_duration": plan.estimated_duration
                }
                for plan in plans
            ]
        })
    except Exception as e:
        logger.error(f"Failed to create tool orchestration plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create tool orchestration plan: {str(e)}")

@router.post("/sessions/{session_id}/max-mode/execute-tools")
async def execute_tool_orchestration(session_id: str):
    """Execute the tool orchestration plan"""
    try:
        async def event_generator():
            async for event in max_mode_service.execute_tool_orchestration(session_id):
                yield {
                    "event": "tool_orchestration",
                    "data": event
                }
        
        return EventSourceResponse(event_generator())
    except Exception as e:
        logger.error(f"Failed to execute tool orchestration: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to execute tool orchestration: {str(e)}")

@router.post("/sessions/{session_id}/max-mode/process-large-file", response_model=ApiResponse)
async def process_large_file(session_id: str, request: LargeFileRequest):
    """Process large files with Max Mode capabilities"""
    try:
        result = await max_mode_service.process_large_file(
            request.file_path, 
            request.max_lines
        )
        return ApiResponse(data=result)
    except Exception as e:
        logger.error(f"Failed to process large file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process large file: {str(e)}")

@router.get("/max-mode/capabilities", response_model=ApiResponse)
async def list_max_mode_capabilities():
    """List available Max Mode capabilities"""
    capabilities = [
        {
            "name": cap.value,
            "description": cap.value.replace("_", " ").title(),
            "enabled": True
        }
        for cap in MaxModeCapability
    ]
    return ApiResponse(data={"capabilities": capabilities})