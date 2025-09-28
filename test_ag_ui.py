"""Test the ag_ui SDK implementation"""
import json
from ag_ui import (
    # Core types
    RunAgentInput,
    Context,
    Tool,
    State,

    # Messages
    Role,
    UserMessage,
    AssistantMessage,
    ToolMessage,

    # Tool calls
    FunctionCall,
    ToolCall,

    # Events
    EventType,
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    ToolCallStartEvent,
    ToolCallArgsEvent,
    ToolCallEndEvent,
    ToolCallResultEvent,
    RunStartedEvent,
    RunFinishedEvent,

    # Encoder
    EventEncoder,
)


def test_core_types():
    """Test core types creation and validation"""
    print("Testing core types...")

    # Test Context
    context = Context(description="Test context", value="test value")
    assert context.description == "Test context"
    assert context.value == "test value"

    # Test Tool
    tool = Tool(
        name="test_tool",
        description="A test tool",
        parameters={"type": "object", "properties": {"arg": {"type": "string"}}}
    )
    assert tool.name == "test_tool"
    assert tool.description == "A test tool"

    # Test State (flexible)
    state = State(custom_field="test")
    assert state.custom_field == "test"

    print("✓ Core types working correctly")


def test_message_types():
    """Test message types"""
    print("Testing message types...")

    # Test UserMessage
    user_msg = UserMessage(id="msg1", content="Hello, world!")
    assert user_msg.role == Role.USER
    assert user_msg.content == "Hello, world!"

    # Test AssistantMessage
    assistant_msg = AssistantMessage(id="msg2", content="Hi there!")
    assert assistant_msg.role == Role.ASSISTANT

    # Test ToolMessage
    tool_msg = ToolMessage(id="msg3", content="Tool result", tool_call_id="call1")
    assert tool_msg.role == Role.TOOL
    assert tool_msg.tool_call_id == "call1"

    print("✓ Message types working correctly")


def test_tool_calls():
    """Test tool call structures"""
    print("Testing tool calls...")

    # Test FunctionCall
    func_call = FunctionCall(name="test_function", arguments='{"arg": "value"}')
    assert func_call.name == "test_function"
    assert func_call.arguments == '{"arg": "value"}'

    # Test ToolCall
    tool_call = ToolCall(id="call1", function=func_call)
    assert tool_call.id == "call1"
    assert tool_call.type == "function"
    assert tool_call.function.name == "test_function"

    print("✓ Tool calls working correctly")


def test_events():
    """Test event creation and discriminated unions"""
    print("Testing events...")

    # Test lifecycle events
    run_started = RunStartedEvent(thread_id="thread1", run_id="run1")
    assert run_started.type == EventType.RUN_STARTED
    assert run_started.thread_id == "thread1"
    assert run_started.run_id == "run1"

    run_finished = RunFinishedEvent(thread_id="thread1", run_id="run1", result="success")
    assert run_finished.type == EventType.RUN_FINISHED

    # Test text message events
    msg_start = TextMessageStartEvent(message_id="msg1")
    assert msg_start.type == EventType.TEXT_MESSAGE_START
    assert msg_start.message_id == "msg1"
    assert msg_start.role == Role.ASSISTANT

    msg_content = TextMessageContentEvent(message_id="msg1", delta="Hello")
    assert msg_content.type == EventType.TEXT_MESSAGE_CONTENT
    assert msg_content.delta == "Hello"

    # Test empty delta validation
    try:
        TextMessageContentEvent(message_id="msg1", delta="")
        assert False, "Should have raised ValueError for empty delta"
    except ValueError as e:
        assert "Delta must not be an empty string" in str(e)

    msg_end = TextMessageEndEvent(message_id="msg1")
    assert msg_end.type == EventType.TEXT_MESSAGE_END

    # Test tool call events
    tool_start = ToolCallStartEvent(tool_call_id="call1", tool_call_name="test_tool")
    assert tool_start.type == EventType.TOOL_CALL_START
    assert tool_start.tool_call_name == "test_tool"

    tool_args = ToolCallArgsEvent(tool_call_id="call1", delta='{"arg": "value"}')
    assert tool_args.type == EventType.TOOL_CALL_ARGS

    tool_end = ToolCallEndEvent(tool_call_id="call1")
    assert tool_end.type == EventType.TOOL_CALL_END

    tool_result = ToolCallResultEvent(
        message_id="msg1",
        tool_call_id="call1",
        content="Tool execution result"
    )
    assert tool_result.type == EventType.TOOL_CALL_RESULT
    assert tool_result.content == "Tool execution result"

    print("✓ Events working correctly")


def test_event_encoder():
    """Test event encoding for SSE"""
    print("Testing event encoder...")

    encoder = EventEncoder()

    # Create a test event
    event = TextMessageContentEvent(message_id="msg1", delta="Hello world")

    # Encode it
    encoded = encoder.encode(event)

    # Verify format
    assert encoded.startswith("data: ")
    assert encoded.endswith("\n\n")

    # Parse the JSON to verify content
    json_part = encoded[6:-2]  # Remove "data: " and "\n\n"
    parsed = json.loads(json_part)

    assert parsed["type"] == "TEXT_MESSAGE_CONTENT"
    assert parsed["message_id"] == "msg1"
    assert parsed["delta"] == "Hello world"

    print("✓ Event encoder working correctly")


def test_run_agent_input():
    """Test RunAgentInput structure"""
    print("Testing RunAgentInput...")

    input_data = RunAgentInput(
        thread_id="thread1",
        run_id="run1",
        state={"current_step": 1},
        messages=[
            UserMessage(id="msg1", content="Hello"),
        ],
        tools=[
            Tool(name="test_tool", description="A tool", parameters={})
        ],
        context=[
            Context(description="Background", value="Some info"),
        ],
        forwarded_props={"custom": "data"}
    )

    assert input_data.thread_id == "thread1"
    assert input_data.run_id == "run1"
    assert len(input_data.messages) == 1
    assert len(input_data.tools) == 1
    assert len(input_data.context) == 1

    print("✓ RunAgentInput working correctly")


def main():
    """Run all tests"""
    print("🧪 Testing ag_ui SDK implementation...")
    print("=" * 50)

    test_core_types()
    print()

    test_message_types()
    print()

    test_tool_calls()
    print()

    test_events()
    print()

    test_event_encoder()
    print()

    test_run_agent_input()
    print()

    print("🎉 All tests passed! ag_ui SDK is ready to use.")


if __name__ == "__main__":
    main()
