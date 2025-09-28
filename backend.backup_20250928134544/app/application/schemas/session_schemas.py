from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SessionResponse(BaseModel):
    code: int
    msg: str
    data: dict  # e.g., {"session_id": str}

class SessionInfo(BaseModel):
    session_id: str
    title: Optional[str]
    events: List[dict]

class SessionListItem(BaseModel):
    session_id: str
    title: Optional[str]
    latest_message: Optional[str]
    latest_message_at: Optional[int]
    status: str
    unread_message_count: int

class SessionListResponse(BaseModel):
    code: int
    msg: str
    data: dict  # {"sessions": List[SessionListItem]}

# Add more as needed