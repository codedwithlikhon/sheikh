"""
Session service for Sheikh Backend
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import structlog

from app.models.session import Session as SessionModel
from app.schemas.session import SessionCreate, SessionUpdate, SessionResponse

logger = structlog.get_logger(__name__)


class SessionService:
    """Service class for session operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_session(self, session_data: SessionCreate) -> SessionResponse:
        """Create a new session"""
        try:
            db_session = SessionModel(**session_data.dict())
            self.db.add(db_session)
            self.db.commit()
            self.db.refresh(db_session)
            
            logger.info("Session created successfully", session_id=db_session.id)
            return SessionResponse.from_orm(db_session)
        except Exception as e:
            self.db.rollback()
            logger.error("Failed to create session", error=str(e))
            raise
    
    async def get_session(self, session_id: str) -> Optional[SessionResponse]:
        """Get a session by ID"""
        try:
            db_session = self.db.query(SessionModel).filter(
                SessionModel.id == session_id,
                SessionModel.is_active == True
            ).first()
            
            if not db_session:
                return None
            
            return SessionResponse.from_orm(db_session)
        except Exception as e:
            logger.error("Failed to get session", session_id=session_id, error=str(e))
            raise
    
    async def list_sessions(self, skip: int = 0, limit: int = 100) -> List[SessionResponse]:
        """List all sessions"""
        try:
            db_sessions = self.db.query(SessionModel).filter(
                SessionModel.is_active == True
            ).order_by(desc(SessionModel.updated_at)).offset(skip).limit(limit).all()
            
            return [SessionResponse.from_orm(session) for session in db_sessions]
        except Exception as e:
            logger.error("Failed to list sessions", error=str(e))
            raise
    
    async def update_session(self, session_id: str, session_data: SessionUpdate) -> Optional[SessionResponse]:
        """Update a session"""
        try:
            db_session = self.db.query(SessionModel).filter(
                SessionModel.id == session_id,
                SessionModel.is_active == True
            ).first()
            
            if not db_session:
                return None
            
            update_data = session_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_session, field, value)
            
            self.db.commit()
            self.db.refresh(db_session)
            
            logger.info("Session updated successfully", session_id=session_id)
            return SessionResponse.from_orm(db_session)
        except Exception as e:
            self.db.rollback()
            logger.error("Failed to update session", session_id=session_id, error=str(e))
            raise
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session (soft delete)"""
        try:
            db_session = self.db.query(SessionModel).filter(
                SessionModel.id == session_id,
                SessionModel.is_active == True
            ).first()
            
            if not db_session:
                return False
            
            db_session.is_active = False
            self.db.commit()
            
            logger.info("Session deleted successfully", session_id=session_id)
            return True
        except Exception as e:
            self.db.rollback()
            logger.error("Failed to delete session", session_id=session_id, error=str(e))
            raise

