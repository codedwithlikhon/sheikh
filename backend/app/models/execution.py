"""
Execution model for Sheikh Backend
"""

from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Execution(Base):
    """Execution model for tracking code executions"""
    
    __tablename__ = "executions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=True)
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)  # python, javascript, etc.
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    result = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    execution_time = Column(Integer, default=0)  # in milliseconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Execution metadata
    memory_usage = Column(Integer, default=0)  # in MB
    cpu_usage = Column(Integer, default=0)  # in percentage
    
    # Relationships
    session = relationship("Session", back_populates="executions")
    task = relationship("Task", back_populates="executions")
    
    def __repr__(self):
        return f"<Execution(id='{self.id}', language='{self.language}', status='{self.status}')>"

