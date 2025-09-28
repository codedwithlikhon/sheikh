"""
Task model for Sheikh Backend
"""

from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Task(Base):
    """Task model for managing AI agent tasks"""
    
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    priority = Column(Integer, default=1)  # 1-5 priority levels
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Task execution details
    execution_time = Column(Integer, default=0)  # in seconds
    result = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    session = relationship("Session", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task(id='{self.id}', title='{self.title}', status='{self.status}')>"

