const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Mock data
const mockSessions = {};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sheikh-mockserver' });
});

// Mock session endpoints
app.put('/api/v1/sessions', (req, res) => {
  const sessionId = `session-${Date.now()}`;
  mockSessions[sessionId] = {
    id: sessionId,
    title: 'Mock Session',
    events: [],
    created_at: Date.now(),
    updated_at: Date.now()
  };

  res.json({
    code: 0,
    msg: 'success',
    data: { session_id: sessionId }
  });
});

app.get('/api/v1/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  if (!mockSessions[sessionId]) {
    return res.status(404).json({
      code: 404,
      msg: 'Session not found',
      data: null
    });
  }

  res.json({
    code: 0,
    msg: 'success',
    data: mockSessions[sessionId]
  });
});

app.get('/api/v1/sessions', (req, res) => {
  const sessions = Object.keys(mockSessions).map(sessionId => {
    const session = mockSessions[sessionId];
    return {
      session_id: sessionId,
      title: session.title,
      latest_message: session.events.length > 0 ? session.events[session.events.length - 1].content : '',
      latest_message_at: session.updated_at,
      status: 'active',
      unread_message_count: 0
    };
  });

  res.json({
    code: 0,
    msg: 'success',
    data: { sessions }
  });
});

app.post('/api/v1/sessions/:sessionId/chat', (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;

  if (!mockSessions[sessionId]) {
    return res.status(404).json({
      code: 404,
      msg: 'Session not found',
      data: null
    });
  }

  // Add user message
  const userEventId = `event-${Date.now()}-user`;
  mockSessions[sessionId].events.push({
    id: userEventId,
    role: 'user',
    content: message,
    timestamp: Date.now()
  });

  // Add mock response
  const assistantEventId = `event-${Date.now()}-assistant`;
  mockSessions[sessionId].events.push({
    id: assistantEventId,
    role: 'assistant',
    content: `Mock response to: ${message}`,
    timestamp: Date.now()
  });

  mockSessions[sessionId].updated_at = Date.now();

  res.json({
    code: 0,
    msg: 'success',
    data: { event_id: assistantEventId }
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock server running on port ${PORT}`);
});