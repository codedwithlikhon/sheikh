"""
Session schemas for Sheikh Backend
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class SessionBase(BaseModel):
    """Base session schema"""
    title: str = Field(..., min_length=1, max_length=255)
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


class SessionResponse(SessionBase):
    """Schema for session response"""
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool
    total_messages: int = 0
    last_message_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

