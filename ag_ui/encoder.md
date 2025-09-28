# Event Encoder

The `EventEncoder` class converts `BaseEvent` objects into Server-Sent Events (SSE) format for real-time streaming to clients.

## Basic Usage

```python
from ag_ui.encoder import EventEncoder
from ag_ui.core import TextMessageContentEvent

# Create encoder
encoder = EventEncoder()

# Encode an event
event = TextMessageContentEvent(message_id="msg_123", delta="Hello world!")
encoded = encoder.encode(event)

print(encoded)
# Output: data: {"type": "TEXT_MESSAGE_CONTENT", "message_id": "msg_123", "delta": "Hello world!"}\n\n
```

## Encoder Initialization

```python
# Basic encoder
encoder = EventEncoder()

# With content type specification
encoder = EventEncoder(accept="text/event-stream")
```

The `accept` parameter can be used to specify the content type the client accepts, though it's not currently used in encoding.

## Server-Sent Events Format

The encoder produces output following the SSE specification:

```
data: {"type": "EVENT_TYPE", ...}\n\n
```

Each encoded event contains:
- `data:` prefix
- JSON representation of the event
- Double newline terminator (`\n\n`)

## Event Serialization

Events are serialized using Pydantic's `model_dump()` method:

```python
from ag_ui.core import TextMessageStartEvent

event = TextMessageStartEvent(message_id="msg_456")
json_data = event.model_dump()
# {"type": "TEXT_MESSAGE_START", "timestamp": null, "raw_event": null, "message_id": "msg_456", ...}
```

All event fields are included in the serialization, including optional fields with `null` values.

## Streaming Example

```python
from ag_ui.core import (
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent
)
from ag_ui.encoder import EventEncoder

encoder = EventEncoder()

# Simulate streaming a message
events = [
    TextMessageStartEvent(message_id="msg_1"),
    TextMessageContentEvent(message_id="msg_1", delta="Hello"),
    TextMessageContentEvent(message_id="msg_1", delta=" "),
    TextMessageContentEvent(message_id="msg_1", delta="world!"),
    TextMessageEndEvent(message_id="msg_1")
]

# Stream to client
for event in events:
    sse_data = encoder.encode(event)
    # Send sse_data to client via HTTP streaming response
    print(sse_data)
```

## Client-Side Processing

Clients receive the SSE stream and parse events:

```javascript
// Client-side JavaScript
const eventSource = new EventSource('/api/stream');

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Event type:', data.type);

    switch(data.type) {
        case 'TEXT_MESSAGE_START':
            // Start new message
            break;
        case 'TEXT_MESSAGE_CONTENT':
            // Append content
            appendToMessage(data.delta);
            break;
        case 'TEXT_MESSAGE_END':
            // Finish message
            break;
    }
};
```

## Error Handling

The encoder assumes valid events:

```python
from ag_ui.core import TextMessageContentEvent
from ag_ui.encoder import EventEncoder

encoder = EventEncoder()

try {
    # This will raise a ValidationError during event creation
    event = TextMessageContentEvent(message_id="msg_1", delta="")  # Empty delta
    encoded = encoder.encode(event)
} catch (ValidationError) {
    console.log("Invalid event");
}
```

Always create events with valid data before encoding. The `TextMessageContentEvent` validates that `delta` is non-empty.

## Performance Considerations

- Events are serialized to JSON on each encode call
- For high-frequency streaming, consider event batching or connection optimization
- The SSE format adds minimal overhead (`data: ` + `\n\n`)

## Integration with Web Frameworks

### FastAPI Example

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from ag_ui.encoder import EventEncoder
from ag_ui.core import TextMessageContentEvent

app = FastAPI()
encoder = EventEncoder()

@app.get("/stream")
async def stream_events():
    async def generate():
        # Generate events
        events = [
            TextMessageContentEvent(message_id="1", delta="Hello"),
            TextMessageContentEvent(message_id="1", delta=" World!")
        ]

        for event in events:
            yield encoder.encode(event)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )
```

### Node.js Example

```javascript
const express = require('express');
const { EventEncoder } = require('ag-ui-protocol');

const app = express();
const encoder = new EventEncoder();

app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    // Send events
    const events = [
        new TextMessageContentEvent('msg1', 'Streaming'),
        new TextMessageContentEvent('msg1', ' data!')
    ];

    events.forEach(event => {
        res.write(encoder.encode(event));
    });

    res.end();
});
