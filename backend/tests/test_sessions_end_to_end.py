"""End-to-end tests for the session management API."""

from __future__ import annotations

from pathlib import Path
from typing import Iterator

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


# Ensure we always use simulated MCP tool responses during tests.
settings.ENABLE_MCP_SERVICES = False


@pytest.fixture(scope="module")
def client() -> Iterator[TestClient]:
    """Provide a FastAPI test client with a clean SQLite database."""

    db_path = Path(__file__).resolve().parents[1] / "sheikh.db"
    if db_path.exists():
        db_path.unlink()

    with TestClient(app) as test_client:
        yield test_client


def test_session_lifecycle_end_to_end(client: TestClient) -> None:
    """Verify the happy-path lifecycle for sessions and tool execution."""

    # Create a session
    create_response = client.put("/api/v1/sessions/")
    assert create_response.status_code == 200
    create_payload = create_response.json()
    assert create_payload["code"] == 0
    session_id = create_payload["data"]["session_id"]

    # Retrieve the session
    get_response = client.get(f"/api/v1/sessions/{session_id}")
    assert get_response.status_code == 200
    session_payload = get_response.json()
    assert session_payload["data"]["session_id"] == session_id
    assert session_payload["data"]["events"] == []

    # List sessions and ensure the created one is present
    list_response = client.get("/api/v1/sessions/")
    assert list_response.status_code == 200
    sessions = list_response.json()["data"]["sessions"]
    assert any(item["session_id"] == session_id for item in sessions)

    # Execute a tool (simulated fetch) and verify the structure of the result
    tool_response = client.post(
        f"/api/v1/sessions/{session_id}/tools",
        json={"tool": "fetch", "params": {"url": "https://example.com"}},
    )
    assert tool_response.status_code == 200
    tool_payload = tool_response.json()
    assert tool_payload["code"] == 0
    assert tool_payload["data"]["tool"] == "fetch"
    assert tool_payload["data"]["mode"] == "simulated"
    assert "summary" in tool_payload["data"]["data"]

    # Stream a chat response and ensure it terminates with a done event
    with client.stream(
        "GET",
        f"/api/v1/sessions/{session_id}/chat",
        params={"message": "Hello there"},
        headers={"accept": "text/event-stream"},
    ) as stream:
        chunks = list(stream.iter_text())

    payload = "".join(chunks)
    assert "I received your message" in payload
    assert "event: done" in payload

    # Stop and delete the session
    stop_response = client.post(f"/api/v1/sessions/{session_id}/stop")
    assert stop_response.status_code == 200
    assert stop_response.json()["code"] == 0

    delete_response = client.delete(f"/api/v1/sessions/{session_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["code"] == 0

    # Ensure the session no longer exists
    missing_response = client.get(f"/api/v1/sessions/{session_id}")
    assert missing_response.status_code == 404

