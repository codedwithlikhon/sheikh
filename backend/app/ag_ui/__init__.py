"""Agent User Interaction Protocol SDK"""

__version__ = "0.1.0"

# Core types and events
from .core import (
    # Base classes
    ConfiguredBaseModel,
    BaseEvent,

    # Core types
    State,
    RunAgentInput,
    Context,
    Tool,

    # Message types
    Role,
    Message,
    DeveloperMessage,
    SystemMessage,
    AssistantMessage,
    UserMessage,
    ToolMessage,

    # Tool call types
    FunctionCall,
    ToolCall,

    # Event types
    EventType,
    Event,

    # Lifecycle events
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    StepStartedEvent,
    StepFinishedEvent,

    # Text message events
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,

    # Tool call events
    ToolCallStartEvent,
    ToolCallArgsEvent,
    ToolCallEndEvent,
    ToolCallResultEvent,

    # State management events
    StateSnapshotEvent,
    StateDeltaEvent,
    MessagesSnapshotEvent,

    # Special events
    RawEvent,
    CustomEvent,
)

# Encoder
from .encoder import EventEncoder

__all__ = [
    # Base classes
    "ConfiguredBaseModel",
    "BaseEvent",

    # Core types
    "State",
    "RunAgentInput",
    "Context",
    "Tool",

    # Message types
    "Role",
    "Message",
    "DeveloperMessage",
    "SystemMessage",
    "AssistantMessage",
    "UserMessage",
    "ToolMessage",

    # Tool call types
    "FunctionCall",
    "ToolCall",

    # Event types
    "EventType",
    "Event",

    # Lifecycle events
    "RunStartedEvent",
    "RunFinishedEvent",
    "RunErrorEvent",
    "StepStartedEvent",
    "StepFinishedEvent",

    # Text message events
    "TextMessageStartEvent",
    "TextMessageContentEvent",
    "TextMessageEndEvent",

    # Tool call events
    "ToolCallStartEvent",
    "ToolCallArgsEvent",
    "ToolCallEndEvent",
    "ToolCallResultEvent",

    # State management events
    "StateSnapshotEvent",
    "StateDeltaEvent",
    "MessagesSnapshotEvent",

    # Special events
    "RawEvent",
    "CustomEvent",

    # Encoder
    "EventEncoder",
]
