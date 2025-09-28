"""
Session Management API Endpoints
Provides endpoints for creating, retrieving, listing, and deleting sessions.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, Depends, status
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
import structlog
import time
import uuid
import json
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.session import Session as SessionModel
from app.schemas.session import SessionCreate, SessionResponse, SessionUpdate
from app.services.session_service import SessionService
from app.services.mcp.playwright_service import PlaywrightMCPService
from app.services.mcp.fetch_service import FetchMCPService

logger = structlog.get_logger(__name__)
router = APIRouter()

# Initialize MCP services
playwright_service = PlaywrightMCPService()
fetch_service = FetchMCPService()

@router.put("/", response_model=Dict[str, Any])
async def create_session(db: Session = Depends(get_db)):
    """Create a new conversation session."""
    try:
        session_id = str(uuid.uuid4())
        session_service = SessionService(db)
        session_data = SessionCreate(title="New Conversation")
        await session_service.create_session(session_data)
        logger.info("Session created", session_id=session_id)
        return {"code": 0, "msg": "success", "data": {"session_id": session_id}}
    except Exception as e:
        logger.error("Failed to create session", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@router.get("/{session_id}", response_model=Dict[str, Any])
async def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get session information including conversation history."""
    try:
        session_service = SessionService(db)
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        return {
            "code": 0, 
            "msg": "success", 
            "data": {
                "session_id": session_id,
                "title": session.title,
                "events": session.events if hasattr(session, 'events') else []
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get session", session_id=session_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

@router.get("/", response_model=Dict[str, Any])
async def list_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of all sessions."""
    try:
        session_service = SessionService(db)
        sessions = await session_service.list_sessions(skip=skip, limit=limit)
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "sessions": [
                    {
                        "session_id": session.id,
                        "title": session.title,
                        "latest_message": session.latest_message if hasattr(session, 'latest_message') else "",
                        "latest_message_at": int(session.updated_at.timestamp()) if hasattr(session, 'updated_at') else int(time.time()),
                        "status": session.status if hasattr(session, 'status') else "active",
                        "unread_message_count": session.unread_count if hasattr(session, 'unread_count') else 0
                    }
                    for session in sessions
                ]
            }
        }
    except Exception as e:
        logger.error("Failed to list sessions", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")

@router.delete("/{session_id}", response_model=Dict[str, Any])
async def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a session."""
    try:
        session_service = SessionService(db)
        success = await session_service.delete_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        return {"code": 0, "msg": "success", "data": None}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete session", session_id=session_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")

@router.post("/{session_id}/stop", response_model=Dict[str, Any])
async def stop_session(session_id: str, db: Session = Depends(get_db)):
    """Stop an active session."""
    try:
        session_service = SessionService(db)
        success = await session_service.update_session(
            session_id, 
            SessionUpdate(status="stopped")
        )
        if not success:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        return {"code": 0, "msg": "success", "data": None}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to stop session", session_id=session_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to stop session: {str(e)}")

@router.post("/{session_id}/chat")
async def chat_with_session(
    session_id: str, 
    request: Request,
    db: Session = Depends(get_db)
):
    """Send a message to the session and receive streaming response."""
    try:
        # Parse request body
        body = await request.json()
        message = body.get("message", "")
        timestamp = body.get("timestamp", int(time.time()))
        event_id = body.get("event_id", str(uuid.uuid4()))
        
        # Check if session exists
        session_service = SessionService(db)
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")
        
        # Create SSE response generator
        async def event_generator():
            # Send initial message
            yield {
                "event": "message",
                "data": json.dumps({
                    "content": "I'm processing your request...",
                    "role": "assistant",
                    "event_id": str(uuid.uuid4())
                })
            }
            
            # Process message and generate response
            try:
                # Example of tool usage (Playwright)
                if "browse" in message.lower():
                    # Send tool event
                    yield {
                        "event": "tool",
                        "data": json.dumps({
                            "tool": "browser_navigate",
                            "status": "started",
                            "event_id": str(uuid.uuid4())
                        })
                    }
                    
                    # Execute browser navigation
                    url = "https://example.com"  # Extract from message in real implementation
                    result = await playwright_service.navigate(url)
                    
                    # Send tool result
                    yield {
                        "event": "tool",
                        "data": json.dumps({
                            "tool": "browser_navigate",
                            "status": "completed",
                            "result": {"url": url, "success": True},
                            "event_id": str(uuid.uuid4())
                        })
                    }
                    
                    # Take screenshot
                    screenshot_result = await playwright_service.take_screenshot()
                    
                    # Send final response
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "content": f"I've navigated to {url} and taken a screenshot.",
                            "role": "assistant",
                            "event_id": str(uuid.uuid4())
                        })
                    }
                
                # Example of fetch usage
                elif "search" in message.lower():
                    # Send tool event
                    yield {
                        "event": "tool",
                        "data": json.dumps({
                            "tool": "fetch",
                            "status": "started",
                            "event_id": str(uuid.uuid4())
                        })
                    }
                    
                    # Execute fetch
                    url = "https://example.com"  # Extract from message in real implementation
                    result = await fetch_service.fetch_url(url)
                    
                    # Send tool result
                    yield {
                        "event": "tool",
                        "data": json.dumps({
                            "tool": "fetch",
                            "status": "completed",
                            "result": {"url": url, "success": True},
                            "event_id": str(uuid.uuid4())
                        })
                    }
                    
                    # Send final response
                    content = "Here's what I found on the web:\n\n"
                    content += "Example content from the website..."
                    
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "content": content,
                            "role": "assistant",
                            "event_id": str(uuid.uuid4())
                        })
                    }
                
                # Default response
                else:
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "content": "I received your message: " + message,
                            "role": "assistant",
                            "event_id": str(uuid.uuid4())
                        })
                    }
                
                # Send done event
                yield {
                    "event": "done",
                    "data": json.dumps({
                        "event_id": str(uuid.uuid4())
                    })
                }
                
            except Exception as e:
                # Send error event
                yield {
                    "event": "error",
                    "data": json.dumps({
                        "error": str(e),
                        "event_id": str(uuid.uuid4())
                    })
                }
        
        return EventSourceResponse(event_generator())
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to process chat", session_id=session_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")
            detail="Failed to list sessions"
        )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific session"""
    try:
        session_service = SessionService(db)
        session = await session_service.get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get session", session_id=session_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get session"
        )


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    session_data: SessionUpdate,
    db: Session = Depends(get_db)
):
    """Update a session"""
    try:
        session_service = SessionService(db)
        session = await session_service.update_session(session_id, session_data)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        logger.info("Session updated", session_id=session_id)
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update session", session_id=session_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update session"
        )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Delete a session"""
    try:
        session_service = SessionService(db)
        success = await session_service.delete_session(session_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        logger.info("Session deleted", session_id=session_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete session", session_id=session_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session"
        )

