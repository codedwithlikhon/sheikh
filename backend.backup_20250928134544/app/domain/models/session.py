from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Literal, Union, Enum
from datetime import datetime
import uuid
from enum import Enum as PyEnum

# EventType Enum based on Agent UI Protocol
class EventType(str, PyEnum):
    TEXT_MESSAGE_START = "TEXT_MESSAGE_START"
    TEXT_MESSAGE_CONTENT = "TEXT_MESSAGE_CONTENT"
    TEXT_MESSAGE_END = "TEXT_MESSAGE_END"
    TOOL_CALL_START = "TOOL_CALL_START"
    TOOL_CALL_ARGS = "TOOL_CALL_ARGS"
    TOOL_CALL_END = "TOOL_CALL_END"
    TOOL_CALL_RESULT = "TOOL_CALL_RESULT"
    STATE_SNAPSHOT = "STATE_SNAPSHOT"
    STATE_DELTA = "STATE_DELTA"
    MESSAGES_SNAPSHOT = "MESSAGES_SNAPSHOT"
    RAW = "RAW"
    CUSTOM = "CUSTOM"
    RUN_STARTED = "RUN_STARTED"
    RUN_FINISHED = "RUN_FINISHED"
    RUN_ERROR = "RUN_ERROR"
    STEP_STARTED = "STEP_STARTED"
    STEP_FINISHED = "STEP_FINISHED"

# Base Event Model
class BaseEvent(BaseModel):
    """Base event model for all events in the Agent UI Protocol"""
    type: EventType
    timestamp: Optional[int] = Field(default_factory=lambda: int(datetime.utcnow().timestamp() * 1000))
    raw_event: Optional[Any] = None
    
    model_config = ConfigDict(extra="allow")

# Lifecycle Events
class RunStartedEvent(BaseEvent):
    """Signals the start of an agent run"""
    type: Literal[EventType.RUN_STARTED]
    thread_id: str
    run_id: str

class RunFinishedEvent(BaseEvent):
    """Signals the successful completion of an agent run"""
    type: Literal[EventType.RUN_FINISHED]
    thread_id: str
    run_id: str
    result: Optional[Any] = None

class RunErrorEvent(BaseEvent):
    """Signals an error during an agent run"""
    type: Literal[EventType.RUN_ERROR]
    message: str
    code: Optional[str] = None

class StepStartedEvent(BaseEvent):
    """Signals the start of a step within an agent run"""
    type: Literal[EventType.STEP_STARTED]
    step_name: str

class StepFinishedEvent(BaseEvent):
    """Signals the completion of a step within an agent run"""
    type: Literal[EventType.STEP_FINISHED]
    step_name: str

# Text Message Events
class TextMessageStartEvent(BaseEvent):
    """Signals the start of a text message"""
    type: Literal[EventType.TEXT_MESSAGE_START]
    message_id: str
    role: Literal["assistant"]

class TextMessageContentEvent(BaseEvent):
    """Represents a chunk of content in a streaming text message"""
    type: Literal[EventType.TEXT_MESSAGE_CONTENT]
    message_id: str
    delta: str  # Non-empty string

class TextMessageEndEvent(BaseEvent):
    """Signals the end of a text message"""
    type: Literal[EventType.TEXT_MESSAGE_END]
    message_id: str

# Tool Call Events
class ToolCallStartEvent(BaseEvent):
    """Signals the start of a tool call"""
    type: Literal[EventType.TOOL_CALL_START]
    tool_call_id: str
    tool_name: str

class ToolCallArgsEvent(BaseEvent):
    """Provides arguments for a tool call"""
    type: Literal[EventType.TOOL_CALL_ARGS]
    tool_call_id: str
    args: Dict[str, Any]

class ToolCallEndEvent(BaseEvent):
    """Signals the end of a tool call"""
    type: Literal[EventType.TOOL_CALL_END]
    tool_call_id: str

class ToolCallResultEvent(BaseEvent):
    """Provides the result of a tool call"""
    type: Literal[EventType.TOOL_CALL_RESULT]
    tool_call_id: str
    result: Any

# Union type for all events
Event = Union[
    RunStartedEvent, RunFinishedEvent, RunErrorEvent,
    StepStartedEvent, StepFinishedEvent,
    TextMessageStartEvent, TextMessageContentEvent, TextMessageEndEvent,
    ToolCallStartEvent, ToolCallArgsEvent, ToolCallEndEvent, ToolCallResultEvent,
    BaseEvent
]

# Tool model
class Tool(BaseModel):
    """Defines a function that an agent can call"""
    name: str
    description: str
    parameters: Dict[str, Any]
    required_parameters: List[str] = Field(default_factory=list)

# Message model
class Message(BaseModel):
    """User assistant communication and tool usage"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user", "assistant", "system", "tool"
    content: Optional[str] = None
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    tool_call_id: Optional[str] = None  # For tool role messages
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Session model
class Session(BaseModel):
    """Represents a conversation session with AI assistant using Agent UI Protocol."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique session identifier")
    thread_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Thread ID for the conversation")
    title: str = Field("New Conversation", description="Session title")
    events: List[Dict[str, Any]] = Field(default_factory=list, description="List of events in the session")
    messages: List[Message] = Field(default_factory=list, description="List of messages in the conversation")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    status: str = Field("active", description="Session status (active, stopped)")
    unread_message_count: int = Field(0, description="Number of unread messages")
    mcp_processes: Dict[str, str] = Field(default_factory=dict, description="Maps tool type to MCP process ID")
    available_tools: List[Tool] = Field(default_factory=list, description="List of available tools for this session")
    state: Dict[str, Any] = Field(default_factory=dict, description="Current state of the session")
    
    def add_event(self, event: Union[Event, Dict[str, Any]]) -> Dict[str, Any]:
        """Add an event to the session"""
        if isinstance(event, BaseEvent):
            event_dict = event.model_dump()
        else:
            event_dict = event
            
        if "timestamp" not in event_dict:
            event_dict["timestamp"] = int(datetime.utcnow().timestamp() * 1000)
            
        self.events.append(event_dict)
        self.updated_at = datetime.utcnow()
        
        # Handle specific event types
        event_type = event_dict.get("type")
        if event_type == EventType.TEXT_MESSAGE_START and event_dict.get("role") == "assistant":
            self.unread_message_count += 1
            
        return event_dict
    
    def add_message(self, content: str, role: str, message_id: Optional[str] = None) -> Message:
        """Add a message to the session"""
        message = Message(
            id=message_id or str(uuid.uuid4()),
            role=role,
            content=content
        )
        
        self.messages.append(message)
        self.updated_at = datetime.utcnow()
        
        if role == "assistant":
            self.unread_message_count += 1
        
        return message
    
    def add_tool_call(self, tool_name: str, args: Dict[str, Any], tool_call_id: Optional[str] = None) -> str:
        """Add a tool call to the session and return the tool call ID"""
        tool_call_id = tool_call_id or str(uuid.uuid4())
        
        # Create tool call start event
        start_event = ToolCallStartEvent(
            type=EventType.TOOL_CALL_START,
            tool_call_id=tool_call_id,
            tool_name=tool_name
        )
        self.add_event(start_event)
        
        # Create tool call args event
        args_event = ToolCallArgsEvent(
            type=EventType.TOOL_CALL_ARGS,
            tool_call_id=tool_call_id,
            args=args
        )
        self.add_event(args_event)
        
        return tool_call_id
    
    def add_tool_result(self, tool_call_id: str, result: Any) -> Dict[str, Any]:
        """Add a tool result to the session"""
        # Create tool call result event
        result_event = ToolCallResultEvent(
            type=EventType.TOOL_CALL_RESULT,
            tool_call_id=tool_call_id,
            result=result
        )
        event_dict = self.add_event(result_event)
        
        # Create tool call end event
        end_event = ToolCallEndEvent(
            type=EventType.TOOL_CALL_END,
            tool_call_id=tool_call_id
        )
        self.add_event(end_event)
        
        return event_dict
    
    def to_summary_dict(self) -> Dict[str, Any]:
        """Convert session to summary dictionary"""
        latest_message = ""
        latest_message_at = self.created_at.timestamp()
        
        for event in reversed(self.events):
            if event.get("type") == "message":
                latest_message = event.get("content", "")
                latest_message_at = event.get("timestamp", latest_message_at)
                break
        
        return {
            "session_id": self.id,
            "title": self.title,
            "latest_message": latest_message,
            "latest_message_at": latest_message_at,
            "status": self.status,
            "unread_message_count": self.unread_message_count
        }