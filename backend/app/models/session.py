"""
Session model for Sheikh Backend
"""

from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Session(Base):
    """Session model for managing conversation sessions"""
    
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active")  # active, paused, completed, failed
    user_id = Column(String(255), nullable=True)  # For future user management
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Session metadata
    total_messages = Column(Integer, default=0)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Session(id='{self.id}', title='{self.title}', status='{self.status}')>"

