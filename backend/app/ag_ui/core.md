# Core Types

The `ag_ui.core` module defines the fundamental data structures used throughout the Agent User Interaction Protocol SDK.

## State

```python
from ag_ui.core import State

# State is flexible and can hold any data
state = State(current_step=1, user_context="some data")
```

The `State` class represents the current state of an agent during execution. It uses Pydantic's extra field configuration to allow arbitrary data fields.

## RunAgentInput

```python
from ag_ui.core import RunAgentInput, UserMessage, Tool, Context

input_data = RunAgentInput(
    thread_id="thread_123",
    run_id="run_456",
    state=State(current_step=1),
    messages=[
        UserMessage(id="msg_1", content="Hello, can you help?"),
        AssistantMessage(id="msg_2", content="Of course!")
    ],
    tools=[
        Tool(name="search", description="Web search tool", parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            }
        })
    ],
    context=[
        Context(description="User preferences", value="prefers detailed answers")
    ],
    forwarded_props={"custom": "data"}
)
```

`RunAgentInput` is the main input structure for running agents, containing:

- `thread_id`: Conversation thread identifier
- `run_id`: Current run identifier
- `state`: Current agent state
- `messages`: List of conversation messages
- `tools`: Available tools the agent can use
- `context`: Additional contextual information
- `forwarded_props`: Custom properties forwarded to the agent

## Context

```python
context = Context(
    description="Background information",
    value="The user is asking about machine learning"
)
```

Represents contextual information provided to agents with a description and value.

## Tool

```python
tool = Tool(
    name="calculator",
    description="Performs mathematical calculations",
    parameters={
        "type": "object",
        "properties": {
            "expression": {"type": "string", "description": "Math expression to evaluate"}
        },
        "required": ["expression"]
    }
)
```

Defines a tool that agents can call, with JSON Schema parameter definitions.

## Tool Calls

```python
from ag_ui.core import ToolCall, FunctionCall

func_call = FunctionCall(
    name="search",
    arguments='{"query": "python tutorials"}'
)

tool_call = ToolCall(
    id="call_123",
    type="function",
    function=func_call
)
```

- `FunctionCall`: Contains function name and JSON-encoded arguments
- `ToolCall`: Wraps a function call with an ID and type

## Message Types

The SDK defines five types of messages:

### UserMessage
```python
user_msg = UserMessage(id="msg_1", content="Hello!", name="John")
```
Messages from users.

### AssistantMessage
```python
assistant_msg = AssistantMessage(
    id="msg_2",
    content="Hi there!",
    tool_calls=[tool_call]
)
```
Messages from assistants, optionally containing tool calls.

### SystemMessage
```python
system_msg = SystemMessage(id="msg_3", content="You are a helpful assistant")
```
System-level instructions.

### DeveloperMessage
```python
dev_msg = DeveloperMessage(id="msg_4", content="Debug mode enabled")
```
Developer-specific messages.

### ToolMessage
```python
tool_msg = ToolMessage(
    id="msg_5",
    content="Search results: ...",
    tool_call_id="call_123",
    error=None
)
```
Results from tool executions.

All message types implement a discriminated union through the `Message` type alias.

## Validation

All models use Pydantic with strict validation:

- Field names and types are validated
- Required fields must be provided
- Custom validators ensure data integrity (e.g., non-empty deltas in content events)
