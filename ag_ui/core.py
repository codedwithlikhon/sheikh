"""Core types and events for the Agent User Interaction Protocol SDK"""
from enum import Enum
from typing import Any, Dict, List, Optional, Union, Literal
from pydantic import BaseModel, Field, ConfigDict, model_validator
from datetime import datetime

class ConfiguredBaseModel(BaseModel):
    """Base model with custom configuration"""
    model_config = ConfigDict(
        populate_by_name=True,
        validate_assignment=True,
        use_enum_values=True
    )

# Core Types
class State(ConfiguredBaseModel):
    """Represents the state of an agent during execution"""
    # Flexible state structure - can hold any data
    model_config = ConfigDict(extra='allow')

class RunAgentInput(ConfiguredBaseModel):
    """Input parameters for running an agent"""
    thread_id: str = Field(description="ID of the conversation thread")
    run_id: str = Field(description="ID of the current run")
    state: Any = Field(description="Current state of the agent")
    messages: List['Message'] = Field(description="Array of messages in the conversation")
    tools: List['Tool'] = Field(description="Array of tools available to the agent")
    context: List['Context'] = Field(description="Array of context objects provided to the agent")
    forwarded_props: Any = Field(description="Additional properties forwarded to the agent")

class Context(ConfiguredBaseModel):
    """Represents a piece of contextual information provided to an agent"""
    description: str = Field(description="Description of what this context represents")
    value: str = Field(description="The actual context value")

class Tool(ConfiguredBaseModel):
    """Defines a tool that can be called by an agent"""
    name: str = Field(description="Name of the tool")
    description: str = Field(description="Description of what the tool does")
    parameters: Dict[str, Any] = Field(description="JSON Schema defining the parameters for the tool")

class FunctionCall(ConfiguredBaseModel):
    """Represents function name and arguments in a tool call"""
    name: str = Field(description="Name of the function to call")
    arguments: str = Field(description="JSON-encoded string of arguments to the function")

class ToolCall(ConfiguredBaseModel):
    """Represents a tool call made by an agent"""
    id: str = Field(description="Unique identifier for the tool call")
    type: Literal["function"] = Field(default="function", description="Type of the tool call, always 'function'")
    function: FunctionCall = Field(description="Details about the function being called")

# Message Types
class Role(str, Enum):
    """Represents the possible roles a message sender can have"""
    DEVELOPER = "developer"
    SYSTEM = "system"
    ASSISTANT = "assistant"
    USER = "user"
    TOOL = "tool"

class DeveloperMessage(ConfiguredBaseModel):
    """Represents a message from a developer"""
    id: str = Field(description="Unique identifier for the message")
    role: Literal[Role.DEVELOPER] = Field(default=Role.DEVELOPER, description="Role is always 'developer'")
    content: str = Field(description="Text content of the message (required)")
    name: Optional[str] = Field(default=None, description="Optional name of the sender")

class SystemMessage(ConfiguredBaseModel):
    """Represents a system message"""
    id: str = Field(description="Unique identifier for the message")
    role: Literal[Role.SYSTEM] = Field(default=Role.SYSTEM, description="Role is always 'system'")
    content: str = Field(description="Text content of the message (required)")
    name: Optional[str] = Field(default=None, description="Optional name of the sender")

class AssistantMessage(ConfiguredBaseModel):
    """Represents a message from an assistant"""
    id: str = Field(description="Unique identifier for the message")
    role: Literal[Role.ASSISTANT] = Field(default=Role.ASSISTANT, description="Role is always 'assistant'")
    content: Optional[str] = Field(default=None, description="Optional text content of the message")
    name: Optional[str] = Field(default=None, description="Optional name of the sender")
    tool_calls: Optional[List[ToolCall]] = Field(default=None, description="Optional tool calls made in this message")

class UserMessage(ConfiguredBaseModel):
    """Represents a message from a user"""
    id: str = Field(description="Unique identifier for the message")
    role: Literal[Role.USER] = Field(default=Role.USER, description="Role is always 'user'")
    content: str = Field(description="Text content of the message (required)")
    name: Optional[str] = Field(default=None, description="Optional name of the sender")

class ToolMessage(ConfiguredBaseModel):
    """Represents a message from a tool"""
    id: str = Field(description="Unique identifier for the message")
    content: str = Field(description="Text content of the message")
    role: Literal[Role.TOOL] = Field(default=Role.TOOL, description="Role is always 'tool'")
    tool_call_id: str = Field(description="ID of the tool call this message responds to")
    error: Optional[str] = Field(default=None, description="Optional error message if the tool call failed")

# Union type for all message types
Message = Union[DeveloperMessage, SystemMessage, AssistantMessage, UserMessage, ToolMessage]

# Event Types
class EventType(str, Enum):
    """Event type enumeration"""
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

class BaseEvent(ConfiguredBaseModel):
    """All events inherit from BaseEvent"""
    type: EventType = Field(description="The type of event (discriminator field)")
    timestamp: Optional[int] = Field(default=None, description="Timestamp when the event was created")
    raw_event: Optional[Any] = Field(default=None, description="Original event data if this event was transformed")

# Lifecycle Events
class RunStartedEvent(BaseEvent):
    """Signals the start of an agent run"""
    type: Literal[EventType.RUN_STARTED] = Field(default=EventType.RUN_STARTED)
    thread_id: str = Field(description="ID of the conversation thread")
    run_id: str = Field(description="ID of the agent run")

class RunFinishedEvent(BaseEvent):
    """Signals the successful completion of an agent run"""
    type: Literal[EventType.RUN_FINISHED] = Field(default=EventType.RUN_FINISHED)
    thread_id: str = Field(description="ID of the conversation thread")
    run_id: str = Field(description="ID of the agent run")
    result: Optional[Any] = Field(default=None, description="Result data from the agent run")

class RunErrorEvent(BaseEvent):
    """Signals an error during an agent run"""
    type: Literal[EventType.RUN_ERROR] = Field(default=EventType.RUN_ERROR)
    message: str = Field(description="Error message")
    code: Optional[str] = Field(default=None, description="Error code")

class StepStartedEvent(BaseEvent):
    """Signals the start of a step within an agent run"""
    type: Literal[EventType.STEP_STARTED] = Field(default=EventType.STEP_STARTED)
    step_name: str = Field(description="Name of the step")

class StepFinishedEvent(BaseEvent):
    """Signals the completion of a step within an agent run"""
    type: Literal[EventType.STEP_FINISHED] = Field(default=EventType.STEP_FINISHED)
    step_name: str = Field(description="Name of the step")

# Text Message Events
class TextMessageStartEvent(BaseEvent):
    """Signals the start of a text message"""
    type: Literal[EventType.TEXT_MESSAGE_START] = Field(default=EventType.TEXT_MESSAGE_START)
    message_id: str = Field(description="Unique identifier for the message")
    role: Literal[Role.ASSISTANT] = Field(default=Role.ASSISTANT, description="Role is always assistant")

class TextMessageContentEvent(BaseEvent):
    """Represents a chunk of content in a streaming text message"""
    type: Literal[EventType.TEXT_MESSAGE_CONTENT] = Field(default=EventType.TEXT_MESSAGE_CONTENT)
    message_id: str = Field(description="Matches the ID from TextMessageStartEvent")
    delta: str = Field(description="Text content chunk (non-empty)")

    @model_validator(mode='after')
    def validate_delta_not_empty(self) -> 'TextMessageContentEvent':
        """Ensure delta is not empty"""
        if len(self.delta) == 0:
            raise ValueError("Delta must not be an empty string")
        return self

class TextMessageEndEvent(BaseEvent):
    """Signals the end of a text message"""
    type: Literal[EventType.TEXT_MESSAGE_END] = Field(default=EventType.TEXT_MESSAGE_END)
    message_id: str = Field(description="Matches the ID from TextMessageStartEvent")

# Tool Call Events
class ToolCallStartEvent(BaseEvent):
    """Signals the start of a tool call"""
    type: Literal[EventType.TOOL_CALL_START] = Field(default=EventType.TOOL_CALL_START)
    tool_call_id: str = Field(description="Unique identifier for the tool call")
    tool_call_name: str = Field(description="Name of the tool being called")
    parent_message_id: Optional[str] = Field(default=None, description="ID of the parent message")

class ToolCallArgsEvent(BaseEvent):
    """Represents a chunk of argument data for a tool call"""
    type: Literal[EventType.TOOL_CALL_ARGS] = Field(default=EventType.TOOL_CALL_ARGS)
    tool_call_id: str = Field(description="Matches the ID from ToolCallStartEvent")
    delta: str = Field(description="Argument data chunk")

class ToolCallEndEvent(BaseEvent):
    """Signals the end of a tool call"""
    type: Literal[EventType.TOOL_CALL_END] = Field(default=EventType.TOOL_CALL_END)
    tool_call_id: str = Field(description="Matches the ID from ToolCallStartEvent")

class ToolCallResultEvent(BaseEvent):
    """Provides the result of a tool call execution"""
    type: Literal[EventType.TOOL_CALL_RESULT] = Field(default=EventType.TOOL_CALL_RESULT)
    message_id: str = Field(description="ID of the conversation message this result belongs to")
    tool_call_id: str = Field(description="Matches the ID from the corresponding ToolCallStartEvent")
    content: str = Field(description="The actual result/output content from the tool execution")
    role: Optional[Literal[Role.TOOL]] = Field(default=None, description="Optional role identifier, typically 'tool'")

# State Management Events
class StateSnapshotEvent(BaseEvent):
    """Provides a complete snapshot of an agent's state"""
    type: Literal[EventType.STATE_SNAPSHOT] = Field(default=EventType.STATE_SNAPSHOT)
    snapshot: State = Field(description="Complete state snapshot")

class StateDeltaEvent(BaseEvent):
    """Provides a partial update to an agent's state using JSON Patch"""
    type: Literal[EventType.STATE_DELTA] = Field(default=EventType.STATE_DELTA)
    delta: List[Any] = Field(description="Array of JSON Patch operations (RFC 6902)")

class MessagesSnapshotEvent(BaseEvent):
    """Provides a snapshot of all messages in a conversation"""
    type: Literal[EventType.MESSAGES_SNAPSHOT] = Field(default=EventType.MESSAGES_SNAPSHOT)
    messages: List[Message] = Field(description="Array of message objects")

# Special Events
class RawEvent(BaseEvent):
    """Used to pass through events from external systems"""
    type: Literal[EventType.RAW] = Field(default=EventType.RAW)
    event: Any = Field(description="Original event data")
    source: Optional[str] = Field(default=None, description="Source of the event")

class CustomEvent(BaseEvent):
    """Used for application-specific custom events"""
    type: Literal[EventType.CUSTOM] = Field(default=EventType.CUSTOM)
    name: str = Field(description="Name of the custom event")
    value: Any = Field(description="Value associated with the event")

# Discriminated union for all event types
Event = Union[
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    ToolCallStartEvent,
    ToolCallArgsEvent,
    ToolCallEndEvent,
    ToolCallResultEvent,
    StateSnapshotEvent,
    StateDeltaEvent,
    MessagesSnapshotEvent,
    RawEvent,
    CustomEvent,
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    StepStartedEvent,
    StepFinishedEvent,
]
