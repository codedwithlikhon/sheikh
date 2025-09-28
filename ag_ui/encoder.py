"""Event Encoder for Server-Sent Events streaming"""
import json
from typing import Optional

from .core import BaseEvent


class EventEncoder:
    """
    The EventEncoder class is responsible for encoding BaseEvent objects into string
    representations that can be transmitted to clients.
    """

    def __init__(self, accept: Optional[str] = None):
        """
        Creates a new encoder instance.

        Args:
            accept: Content type accepted by the client
        """
        self.accept = accept

    def encode(self, event: BaseEvent) -> str:
        """
        Encodes an event into a string representation.

        Args:
            event: The event to encode

        Returns:
            A string representation of the event in SSE format.
        """
        # Convert event to dict and then to JSON
        event_dict = event.model_dump()
        json_str = json.dumps(event_dict)

        # Format as Server-Sent Events
        return f"data: {json_str}\n\n"
