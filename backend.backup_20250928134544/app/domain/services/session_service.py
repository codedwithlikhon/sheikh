import uuid
from datetime import datetime
from typing import Dict, List
from ..models.session import Session
from ..models.message import Message

class SessionService:
    """Domain service for managing sessions."""

    def create_session(self) -> Session:
        """Create a new session."""
        return Session(id=str(uuid.uuid4()), title=None, events=[], created_at=datetime.utcnow(), updated_at=datetime.utcnow())

    def add_event(self, session: Session, event: Dict) -> Session:
        """Add an event to the session."""
        session.events.append(event)
        session.updated_at = datetime.utcnow()
        return session

    def add_message(self, session: Session, message: Message) -> Session:
        """Add a message to the session events."""
        event = {"type": "message", "data": message.dict()}
        return self.add_event(session, event)

    # Add more methods as needed