from typing import Dict, List, Optional, Any
from domain.models.session import Session

class SessionService:
    """Service for managing conversation sessions"""
    
    def __init__(self):
        self.sessions: Dict[str, Session] = {}
    
    def create_session(self, title: Optional[str] = None) -> Session:
        """
        Create a new session
        
        Args:
            title: Optional session title
            
        Returns:
            Session: The created session
        """
        session = Session(title=title or "New Conversation")
        self.sessions[session.id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """
        Get a session by ID
        
        Args:
            session_id: Session ID
            
        Returns:
            Session: The session if found, None otherwise
        """
        return self.sessions.get(session_id)
    
    def list_sessions(self) -> List[Dict[str, Any]]:
        """
        List all sessions
        
        Returns:
            List[Dict]: List of session summaries
        """
        return [session.to_summary_dict() for session in self.sessions.values()]
    
    def delete_session(self, session_id: str) -> bool:
        """
        Delete a session
        
        Args:
            session_id: Session ID
            
        Returns:
            bool: True if deleted, False if not found
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def stop_session(self, session_id: str) -> bool:
        """
        Stop a session
        
        Args:
            session_id: Session ID
            
        Returns:
            bool: True if stopped, False if not found
        """
        session = self.get_session(session_id)
        if session:
            session.status = "stopped"
            return True
        return False
    
    def add_message(self, session_id: str, content: str, role: str, event_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Add a message to a session
        
        Args:
            session_id: Session ID
            content: Message content
            role: Message role (user or assistant)
            event_id: Optional event ID
            
        Returns:
            dict: The created event, None if session not found
        """
        session = self.get_session(session_id)
        if session:
            return session.add_message(content, role, event_id)
        return None
    
    def add_tool_event(self, session_id: str, tool_name: str, parameters: Dict[str, Any], result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Add a tool event to a session
        
        Args:
            session_id: Session ID
            tool_name: Name of the tool
            parameters: Tool parameters
            result: Tool result
            
        Returns:
            dict: The created event, None if session not found
        """
        session = self.get_session(session_id)
        if session:
            return session.add_tool_event(tool_name, parameters, result)
        return None

# Create a singleton instance
session_service = SessionService()