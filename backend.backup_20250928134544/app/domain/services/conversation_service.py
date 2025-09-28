from typing import Generator
from ..models.message import Message

class ConversationService:
    """Domain service for handling conversations."""

    def process_message(self, session_id: str, message: str, timestamp: int, event_id: str) -> Generator[Dict, None, None]:
        """Process a user message and generate streaming response."""
        # This would integrate with AI logic, but for domain, mock or define interface
        yield {"type": "message", "content": "Received: " + message}

    # Add tool invocation logic here