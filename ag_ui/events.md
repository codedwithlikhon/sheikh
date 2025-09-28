# Events

Events power the real-time communication between agents and frontend applications. The SDK provides a comprehensive set of event types for different aspects of agent execution.

## Event Base Class

All events inherit from `BaseEvent`:

```python
from ag_ui.core import BaseEvent, EventType

class CustomEvent(BaseEvent):
    type: EventType = EventType.CUSTOM
    # Additional fields...
```

BaseEvent provides:
- `type`: Event type discriminator
- `timestamp`: Optional timestamp
- `raw_event`: Optional original event data

## Lifecycle Events

Track the execution flow of agent runs and steps.

### Run Events

```python
from ag_ui.core import RunStartedEvent, RunFinishedEvent, RunErrorEvent

# Run started
started = RunStartedEvent(thread_id="thread_123", run_id="run_456")

# Run completed successfully
finished = RunFinishedEvent(
    thread_id="thread_123",
    run_id="run_456",
    result={"status": "success"}
)

# Run failed
error = RunErrorEvent(
    message="Agent execution failed",
    code="AGENT_ERROR"
)
```

### Step Events

```python
from ag_ui.core import StepStartedEvent, StepFinishedEvent

# Step began
started = StepStartedEvent(step_name="data_processing")

# Step completed
finished = StepFinishedEvent(step_name="data_processing")
```

## Text Message Events

Handle streaming text messages from assistants.

```python
from ag_ui.core import TextMessageStartEvent, TextMessageContentEvent, TextMessageEndEvent

# Message start
start = TextMessageStartEvent(message_id="msg_123")

# Content chunks (streaming)
content1 = TextMessageContentEvent(message_id="msg_123", delta="Hello")
content2 = TextMessageContentEvent(message_id="msg_123", delta=" world!")

# Message end
end = TextMessageEndEvent(message_id="msg_123")
```

Note: `TextMessageContentEvent` requires non-empty delta strings.

## Tool Call Events

Track the lifecycle of tool invocations.

```python
from ag_ui.core import ToolCallStartEvent, ToolCallArgsEvent, ToolCallEndEvent, ToolCallResultEvent

# Tool call initiated
start = ToolCallStartEvent(
    tool_call_id="call_123",
    tool_call_name="web_search",
    parent_message_id="msg_456"
)

# Arguments (if streaming)
args = ToolCallArgsEvent(
    tool_call_id="call_123",
    delta='{"query": "python"}'
)

# Call completed
call_end = ToolCallEndEvent(tool_call_id="call_123")

# Results received
result = ToolCallResultEvent(
    message_id="msg_789",
    tool_call_id="call_123",
    content="Search results...",
    role="tool"
)
```

## State Management Events

Handle agent state synchronization.

```python
from ag_ui.core import StateSnapshotEvent, StateDeltaEvent, MessagesSnapshotEvent, State

# Complete state snapshot
snapshot = StateSnapshotEvent(
    snapshot=State(step=1, context="active")
)

# Partial state update (JSON Patch)
delta = StateDeltaEvent(delta=[
    {"op": "replace", "path": "/step", "value": 2}
])

# Messages snapshot
messages_snapshot = MessagesSnapshotEvent(messages=[
    # List of Message objects
])
```

## Special Events

Handle custom and external events.

```python
from ag_ui.core import RawEvent, CustomEvent

# Pass through external events
raw = RawEvent(
    event={"type": "external", "data": "value"},
    source="external_system"
)

# Application-specific events
custom = CustomEvent(
    name="user_action",
    value={"action": "clicked_button"}
)
```

## Event Processing

Events form a discriminated union under the `Event` type:

```python
from ag_ui.core import Event

def process_event(event: Event):
    if event.type == EventType.TEXT_MESSAGE_START:
        # Handle text message start
        pass
    elif event.type == EventType.TOOL_CALL_RESULT:
        # Handle tool result
        pass
    # ... handle other event types
```

## Event Flow Patterns

### Agent Response Flow
1. `RunStartedEvent` - Agent execution begins
2. `StepStartedEvent` - Processing steps start
3. `TextMessageStartEvent` - Assistant response begins
4. `TextMessageContentEvent` - Streaming content chunks
5. `TextMessageEndEvent` - Message complete
6. `StepFinishedEvent` - Step completes
7. `RunFinishedEvent` - Agent execution ends

### Tool Usage Flow
1. Agent decides to use tool
2. `ToolCallStartEvent` - Tool invocation starts
3. `ToolCallArgsEvent` - Arguments provided (optional)
4. `ToolCallEndEvent` - Tool call sent
5. Tool executes externally
6. `ToolCallResultEvent` - Results received
7. Agent processes results and continues

## Error Handling

Use `RunErrorEvent` for agent execution failures:

```python
error_event = RunErrorEvent(
    message="Failed to process request",
    code="PROCESSING_ERROR"
)
```

Include error information in `ToolCallResultEvent` when tools fail:

```python
result = ToolCallResultEvent(
    message_id="msg_123",
    tool_call_id="call_456",
    content="",  # Empty content on error
    role="tool"
)
# Error details in associated ToolMessage
