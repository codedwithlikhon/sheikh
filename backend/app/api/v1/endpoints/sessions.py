"""Session Management API Endpoints."""

from __future__ import annotations

import json
import time
import uuid
from typing import Any, Dict, List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from app.core.config import settings
from app.core.database import get_db
from app.schemas.session import SessionCreate, SessionResponse, SessionUpdate
from app.services.mcp.fetch_service import FetchMCPService
from app.services.mcp.playwright_service import PlaywrightMCPService
from app.services.session_service import SessionService

logger = structlog.get_logger(__name__)
router = APIRouter()

# Instantiate MCP services. These are lightweight wrappers that only start external
# processes when explicitly asked to execute a tool.
playwright_service = PlaywrightMCPService()
fetch_service = FetchMCPService()

# Supported tool identifiers exposed through the HTTP API.
SUPPORTED_TOOLS = {
    "browser_navigate",
    "browser_take_screenshot",
    "browser_click",
    "browser_type",
    "browser_snapshot",
    "fetch",
}


class ToolExecutionRequest(BaseModel):
    """Request payload for executing a tool within a session."""

    tool: str = Field(description="Identifier of the tool to execute")
    params: Dict[str, Any] = Field(default_factory=dict, description="Tool specific parameters")


def _serialize_session_detail(session: SessionResponse) -> Dict[str, Any]:
    """Convert a ``SessionResponse`` into the response format used by the UI."""

    payload = session.model_dump()
    events: List[Dict[str, Any]] = payload.pop("events", []) or []
    return {
        "session_id": payload["id"],
        "title": payload["title"],
        "description": payload.get("description"),
        "status": payload.get("status"),
        "created_at": payload.get("created_at"),
        "updated_at": payload.get("updated_at"),
        "events": events,
    }


def _serialize_session_summary(session: SessionResponse) -> Dict[str, Any]:
    """Create a summary representation for list views."""

    payload = session.model_dump()
    return {
        "session_id": payload["id"],
        "title": payload["title"],
        "status": payload.get("status"),
        "created_at": payload.get("created_at"),
        "updated_at": payload.get("updated_at"),
        "unread_message_count": payload.get("total_messages", 0),
    }


def _fallback_tool_payload(tool: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Provide deterministic fallback results when MCP services are unavailable."""

    now = int(time.time())
    if tool == "browser_navigate":
        url = params.get("url", "about:blank")
        return {
            "summary": f"Navigated to {url}",
            "url": url,
            "timestamp": now,
        }
    if tool == "browser_take_screenshot":
        filename = params.get("filename") or "screenshot.png"
        return {
            "summary": f"Captured screenshot {filename}",
            "filename": filename,
            "fullPage": bool(params.get("fullPage", False)),
            "timestamp": now,
        }
    if tool == "browser_click":
        return {
            "summary": "Clicked element",
            "element": params.get("element", "unknown"),
            "ref": params.get("ref"),
            "timestamp": now,
        }
    if tool == "browser_type":
        return {
            "summary": "Typed text",
            "element": params.get("element", "unknown"),
            "ref": params.get("ref"),
            "text": params.get("text", ""),
            "submitted": bool(params.get("submit", False)),
            "timestamp": now,
        }
    if tool == "browser_snapshot":
        return {
            "summary": "Captured page snapshot",
            "nodes": 42,
            "timestamp": now,
        }
    if tool == "fetch":
        url = params.get("url", "")
        return {
            "summary": f"Fetched content from {url}".strip(),
            "url": url,
            "content": "Example content preview...",
            "timestamp": now,
        }

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported tool '{tool}'")


async def _execute_live_tool(tool: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Attempt to run the requested tool using the MCP services."""

    if tool == "fetch":
        result = await fetch_service.fetch_url(
            params.get("url", ""),
            max_length=params.get("max_length"),
            raw=params.get("raw", False),
            start_index=params.get("start_index", 0),
        )
        if result.get("success"):
            return {
                "tool": tool,
                "mode": "live",
                "data": {
                    "url": params.get("url"),
                    "content": result.get("content", ""),
                },
            }
        raise RuntimeError(result.get("error") or "Fetch tool execution failed")

    if tool == "browser_navigate":
        result = await playwright_service.navigate(params.get("url", ""))
    elif tool == "browser_take_screenshot":
        result = await playwright_service.take_screenshot(
            filename=params.get("filename"),
            full_page=bool(params.get("fullPage", False)),
        )
    elif tool == "browser_click":
        result = await playwright_service.click(
            params.get("element", ""),
            params.get("ref", ""),
        )
    elif tool == "browser_type":
        result = await playwright_service.type_text(
            params.get("element", ""),
            params.get("ref", ""),
            params.get("text", ""),
            submit=bool(params.get("submit", False)),
        )
    elif tool == "browser_snapshot":
        result = await playwright_service.get_snapshot()
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported tool '{tool}'")

    if result.get("success"):
        return {
            "tool": tool,
            "mode": "live",
            "data": result.get("result", {}),
        }

    raise RuntimeError(result.get("error") or "Playwright tool execution failed")


async def _safe_execute_tool(tool: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a tool, falling back to deterministic results when needed."""

    if tool not in SUPPORTED_TOOLS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported tool '{tool}'")

    if settings.ENABLE_MCP_SERVICES:
        try:
            return await _execute_live_tool(tool, params)
        except Exception as exc:  # pragma: no cover - fallback path
            logger.warning(
                "Live MCP tool execution failed, using simulated response",
                tool=tool,
                error=str(exc),
            )

    fallback = _fallback_tool_payload(tool, params)
    return {
        "tool": tool,
        "mode": "simulated",
        "data": fallback,
    }


@router.put("/", response_model=Dict[str, Any])
async def create_session(
    session_data: Optional[SessionCreate] = None,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new conversation session and return its identifier."""

    try:
        session_service = SessionService(db)
        payload = session_data or SessionCreate()
        session = await session_service.create_session(payload)
        logger.info("Session created", session_id=session.id)
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "session_id": session.id,
                "title": session.title,
                "status": session.status,
            },
        }
    except Exception as exc:
        logger.error("Failed to create session", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to create session: {exc}")


@router.get("/{session_id}", response_model=Dict[str, Any])
async def get_session(session_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve a session including its stored events."""

    session_service = SessionService(db)
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    return {
        "code": 0,
        "msg": "success",
        "data": _serialize_session_detail(session),
    }


@router.get("/", response_model=Dict[str, Any])
async def list_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """List available sessions."""

    session_service = SessionService(db)
    sessions = await session_service.list_sessions(skip=skip, limit=limit)
    return {
        "code": 0,
        "msg": "success",
        "data": {
            "sessions": [_serialize_session_summary(session) for session in sessions],
        },
    }


@router.delete("/{session_id}", response_model=Dict[str, Any])
async def delete_session(session_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Soft-delete a session."""

    session_service = SessionService(db)
    success = await session_service.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    logger.info("Session deleted", session_id=session_id)
    return {"code": 0, "msg": "success", "data": None}


@router.post("/{session_id}/stop", response_model=Dict[str, Any])
async def stop_session(session_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Mark a session as stopped."""

    session_service = SessionService(db)
    session = await session_service.update_session(session_id, SessionUpdate(status="stopped"))
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    logger.info("Session stopped", session_id=session_id)
    return {"code": 0, "msg": "success", "data": None}


@router.post("/{session_id}/tools", response_model=Dict[str, Any])
async def execute_tool(
    session_id: str,
    request: ToolExecutionRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Execute a tool for the specified session."""

    session_service = SessionService(db)
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    tool_result = await _safe_execute_tool(request.tool, request.params)
    return {"code": 0, "msg": "success", "data": tool_result}


@router.api_route("/{session_id}/chat", methods=["GET", "POST"])
async def chat_with_session(
    session_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Stream a conversational response for the session."""

    session_service = SessionService(db)
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    body = await request.json() if request.method != "GET" else {}
    message = body.get("message") or request.query_params.get("message", "")
    timestamp = body.get("timestamp", int(time.time()))

    async def event_generator():
        yield {
            "event": "message",
            "data": json.dumps(
                {
                    "content": "I'm processing your request...",
                    "role": "assistant",
                    "event_id": str(uuid.uuid4()),
                    "timestamp": timestamp,
                }
            ),
        }

        try:
            lower_message = (message or "").lower()
            if "browse" in lower_message:
                url = "https://example.com"
                yield {
                    "event": "tool",
                    "data": json.dumps(
                        {
                            "tool": "browser_navigate",
                            "status": "started",
                            "event_id": str(uuid.uuid4()),
                        }
                    ),
                }

                navigate_result = await _safe_execute_tool("browser_navigate", {"url": url})
                yield {
                    "event": "tool",
                    "data": json.dumps(
                        {
                            "tool": "browser_navigate",
                            "status": "completed",
                            "result": navigate_result,
                            "event_id": str(uuid.uuid4()),
                        }
                    ),
                }

                screenshot_result = await _safe_execute_tool("browser_take_screenshot", {})
                yield {
                    "event": "tool",
                    "data": json.dumps(
                        {
                            "tool": "browser_take_screenshot",
                            "status": "completed",
                            "result": screenshot_result,
                            "event_id": str(uuid.uuid4()),
                        }
                    ),
                }

                yield {
                    "event": "message",
                    "data": json.dumps(
                        {
                            "content": f"I've navigated to {url} and captured a screenshot.",
                            "role": "assistant",
                            "event_id": str(uuid.uuid4()),
                        }
                    ),
                }

            elif "search" in lower_message:
                url = "https://example.com"
                yield {
                    "event": "tool",
                    "data": json.dumps(
                        {
                            "tool": "fetch",
                            "status": "started",
                            "event_id": str(uuid.uuid4()),
                        }
                    ),
                }

                fetch_result = await _safe_execute_tool("fetch", {"url": url})
                yield {
                    "event": "tool",
                    "data": json.dumps(
                        {
                            "tool": "fetch",
                            "status": "completed",
                            "result": fetch_result,
                            "event_id": str(uuid.uuid4()),
                        }
                    ),
                }

                summary = fetch_result["data"].get("summary") if isinstance(fetch_result, dict) else None
                content = "Here's what I found:\n\n" + (summary or "Sample results available.")
                yield {
                    "event": "message",
                    "data": json.dumps(
                        {
                            "content": content,
                            "role": "assistant",
                            "event_id": str(uuid.uuid4()),
                        }
                    ),
                }

            else:
                yield {
                    "event": "message",
                    "data": json.dumps(
                        {
                            "content": f"I received your message: {message}",
                            "role": "assistant",
                            "event_id": str(uuid.uuid4()),
                        }
                    ),
                }

            yield {
                "event": "done",
                "data": json.dumps({"event_id": str(uuid.uuid4())}),
            }
        except Exception as exc:  # pragma: no cover - network errors
            logger.error("Failed to stream chat response", session_id=session_id, error=str(exc))
            yield {
                "event": "error",
                "data": json.dumps(
                    {
                        "error": str(exc),
                        "event_id": str(uuid.uuid4()),
                    }
                ),
            }

    return EventSourceResponse(event_generator())

