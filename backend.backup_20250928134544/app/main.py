from fastapi import FastAPI, WebSocket, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import uuid
import json
import os
from typing import Dict, List, Optional
import asyncio

# Import AI Gateway routes
from .interfaces.api.ai_gateway_routes import router as ai_gateway_router

app = FastAPI(title="Sheikh Backend API")

# Include AI Gateway routes
app.include_router(ai_gateway_router, prefix="/api/v1")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage
sessions = {}
sandbox_url = os.environ.get("SANDBOX_URL", "http://localhost:8080")

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "sheikh-backend"}

@app.put("/api/v1/sessions")
async def create_session():
    """Create a new conversation session"""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "id": session_id,
        "title": "New Session",
        "events": [],
        "created_at": asyncio.get_event_loop().time(),
        "updated_at": asyncio.get_event_loop().time(),
    }
    return {"code": 0, "msg": "success", "data": {"session_id": session_id}}

@app.get("/api/v1/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session information including conversation history"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "code": 0,
        "msg": "success",
        "data": sessions[session_id]
    }

@app.get("/api/v1/sessions")
async def list_sessions():
    """Get list of all sessions"""
    session_list = []
    for session_id, session in sessions.items():
        latest_message = ""
        if session["events"]:
            latest_message = session["events"][-1].get("content", "")
        
        session_list.append({
            "session_id": session_id,
            "title": session["title"],
            "latest_message": latest_message,
            "latest_message_at": session["updated_at"],
            "status": "active",
            "unread_message_count": 0
        })
    
    return {"code": 0, "msg": "success", "data": {"sessions": session_list}}

@app.delete("/api/v1/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    del sessions[session_id]
    return {"code": 0, "msg": "success", "data": None}

@app.post("/api/v1/sessions/{session_id}/stop")
async def stop_session(session_id: str):
    """Stop an active session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Add logic to stop any active processes if needed
    
    return {"code": 0, "msg": "success", "data": None}

@app.post("/api/v1/sessions/{session_id}/chat")
async def chat(session_id: str, request: Request):
    """Send a message to the session and receive streaming response"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    data = await request.json()
    message = data.get("message", "")
    timestamp = data.get("timestamp", asyncio.get_event_loop().time())
    event_id = data.get("event_id", str(uuid.uuid4()))
    
    # Add user message to session history
    sessions[session_id]["events"].append({
        "id": event_id,
        "role": "user",
        "content": message,
        "timestamp": timestamp
    })
    
    # Update session timestamp
    sessions[session_id]["updated_at"] = asyncio.get_event_loop().time()
    
    # In a real implementation, this would connect to an AI service
    # For now, we'll just echo back a simple response
    response_event_id = str(uuid.uuid4())
    sessions[session_id]["events"].append({
        "id": response_event_id,
        "role": "assistant",
        "content": f"Echo: {message}",
        "timestamp": asyncio.get_event_loop().time()
    })
    
    return {
        "code": 0,
        "msg": "success",
        "data": {
            "event_id": response_event_id
        }
    }

@app.post("/api/v1/sandbox/execute")
async def execute_code(request: Request):
    """Execute code in the sandbox environment"""
    data = await request.json()
    code = data.get("code", "")
    language = data.get("language", "javascript")
    
    # Forward the request to the sandbox service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{sandbox_url}/execute",
                json={"code": code, "language": language}
            )
            return response.json()
        except httpx.RequestError:
            raise HTTPException(status_code=500, detail="Failed to connect to sandbox service")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)