"""
Session schemas for Sheikh Backend
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import time


class SessionBase(BaseModel):
    """Base session schema"""
    title: str = Field(default="New Conversation", min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)


class SessionCreate(SessionBase):
    """Schema for creating a session"""
    pass


class SessionUpdate(BaseModel):
    """Schema for updating a session"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)
    latest_message: Optional[str] = None
    unread_count: Optional[int] = None


class SessionResponse(SessionBase):
    """Schema for session response"""

    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool
    total_messages: int = 0
    last_message_at: Optional[datetime] = None
    events: List[Dict[str, Any]] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    """Schema for chat message"""
    message: str
    timestamp: Optional[float] = Field(default_factory=lambda: time.time())
    event_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))


class SessionDetail(BaseModel):
    """Schema for detailed session information"""
    code: int = 0
    msg: str = "success"
    data: Dict[str, Any]


class SessionList(BaseModel):
    """Schema for list of sessions"""
    code: int = 0
    msg: str = "success"
    data: Dict[str, Any]

