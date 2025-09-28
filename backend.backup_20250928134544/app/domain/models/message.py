from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Message(BaseModel):
    """Represents a message in the conversation."""
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Message timestamp")
    sender: str = Field(..., description="Sender of the message (user or assistant)")
    event_id: Optional[str] = Field(None, description="Optional event ID")