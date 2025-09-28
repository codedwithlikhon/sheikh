# Agent User Interaction Protocol SDK

The Agent User Interaction Protocol SDK (`ag_ui`) provides a streaming event-based architecture for building agent systems. This package offers strongly typed data structures and event handling for seamless communication between agents and frontend applications.

## Installation

```bash
pip install ag-ui-protocol
```

## Quick Start

```python
from ag_ui.core import RunAgentInput, UserMessage, AssistantMessage
from ag_ui.encoder import EventEncoder

# Create a run input
run_input = RunAgentInput(
    thread_id="thread_123",
    run_id="run_456",
    state={"current_step": 1},
    messages=[
        UserMessage(id="msg_1", content="Hello, can you help me?"),
        AssistantMessage(id="msg_2", content="Of course! What do you need?")
    ],
    tools=[],
    context=[],
    forwarded_props={}
)

# Create and encode events
from ag_ui.core import TextMessageStartEvent, TextMessageContentEvent, TextMessageEndEvent

encoder = EventEncoder()

start_event = TextMessageStartEvent(message_id="msg_3")
content_event = TextMessageContentEvent(message_id="msg_3", delta="I'm here to help!")
end_event = TextMessageEndEvent(message_id="msg_3")

# Encode for streaming
encoded_start = encoder.encode(start_event)
encoded_content = encoder.encode(content_event)
encoded_end = encoder.encode(end_event)

print(encoded_start)  # Server-Sent Events format
```

## Core Concepts

### Types

The SDK defines several core types for building agent interactions:

- **RunAgentInput**: Input parameters for running agents
- **Message**: Union type for different message roles (User, Assistant, System, Developer, Tool)
- **Context**: Contextual information provided to agents
- **Tool**: Function definitions that agents can call
- **State**: Agent state management

### Events

Events power communication between agents and frontends:

- **Lifecycle Events**: Run and step tracking
- **Text Message Events**: Streaming assistant messages
- **Tool Call Events**: Function call lifecycle
- **State Management Events**: Agent state updates
- **Special Events**: Raw and custom events

### Event Encoder

The `EventEncoder` class converts events to Server-Sent Events format for HTTP streaming.

## Documentation

For complete API documentation, see:

- [Core Types](./core.md) - Data structure definitions
- [Events](./events.md) - Complete event reference
- [Encoder](./encoder.md) - Event encoding usage

## License

Apache License 2.0
