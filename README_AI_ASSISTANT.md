# AI Assistant System for CodeAct

A comprehensive AI-powered coding assistant system with browser automation, intelligent model selection, and real-time collaboration features.

## 🚀 Features

### Core AI Capabilities
- **Intelligent Model Selection**: Automatically selects the best AI model based on task complexity, speed requirements, and cost considerations
- **Real-time Streaming**: Server-Sent Events (SSE) for real-time AI responses
- **Context-Aware**: Maintains conversation history and code context
- **Multi-Model Support**: GPT-4o, GPT-4o-mini, GPT-3.5-turbo, Claude-3-5-sonnet

### Browser Automation
- **Playwright Integration**: Full browser automation capabilities
- **Screenshot Capture**: Take screenshots of pages or specific elements
- **Form Automation**: Fill forms, click buttons, navigate pages
- **Element Interaction**: Hover, drag, type, select options
- **Wait Conditions**: Wait for text, elements, or timeouts

### Tool Management
- **MCP Server Integration**: Model Context Protocol for tool management
- **Tool Discovery**: Browse and discover available tools
- **Real-time Status**: Monitor MCP server status and health
- **Category Organization**: Tools organized by category (browser, web, github)

### Session Management
- **Persistent Sessions**: Save and restore conversation sessions
- **Session History**: Complete conversation history with timestamps
- **Multi-Session Support**: Handle multiple concurrent sessions
- **Session Cleanup**: Automatic cleanup of inactive sessions

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── domain/              # Domain models and business logic
│   │   └── models/
│   │       └── session.py   # Session model with events and MCP processes
│   ├── application/         # Application services
│   │   └── services/
│   │       ├── session_service.py    # Session management
│   │       └── ai_service.py         # AI model selection and response
│   ├── infrastructure/      # Infrastructure layer
│   │   └── mcp_server.py    # MCP server management
│   └── interfaces/          # API interfaces
│       └── api/
│           └── routes.py     # REST API endpoints
```

### Frontend (React)
```
client/src/
├── components/
│   ├── ChatInterface.jsx    # Main chat interface
│   ├── ChatInput.jsx        # Message input with features
│   ├── ChatMessage.jsx      # Message display with code highlighting
│   ├── ToolPanel.jsx        # Tool management panel
│   └── ...                  # Existing components
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (for MCP servers)
- OpenAI API key

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-api-key-here"
export GITHUB_PERSONAL_ACCESS_TOKEN="your-github-token"

# Start the backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### MCP Servers Setup
The system automatically manages MCP servers, but you can manually start them:

```bash
# Playwright server (for browser automation)
docker run -i --rm --network host -v /tmp/.X11-unix:/tmp/.X11-unix:rw -e DISPLAY=$DISPLAY mcp/playwright

# Fetch server (for web content)
docker run -i --rm mcp/fetch
```

## 📡 API Endpoints

### Session Management
- `PUT /api/v1/sessions` - Create new session
- `GET /api/v1/sessions/{session_id}` - Get session details
- `GET /api/v1/sessions` - List all sessions
- `DELETE /api/v1/sessions/{session_id}` - Delete session
- `POST /api/v1/sessions/{session_id}/stop` - Stop session

### AI Service
- `POST /api/v1/ai/initialize` - Initialize AI service
- `GET /api/v1/ai/models` - List available models
- `GET /api/v1/ai/models/{model_name}` - Get model details

### Tool Management
- `GET /api/v1/tools` - List available tools
- `GET /api/v1/tools/{tool_name}` - Get tool information
- `GET /api/v1/mcp/servers` - List MCP server status
- `POST /api/v1/mcp/servers/{server_name}/start` - Start MCP server
- `POST /api/v1/mcp/servers/{process_id}/stop` - Stop MCP server

### Chat and Tools
- `POST /api/v1/sessions/{session_id}/chat` - Send message (SSE stream)
- `POST /api/v1/sessions/{session_id}/tools/{tool_name}` - Invoke tool

## 🤖 AI Model Selection

The system intelligently selects models based on:

### Scoring Algorithm
1. **Base Capability Score** (30%): Model's overall capability rating
2. **Speed Consideration** (20-40%): Response speed requirements
3. **Cost Consideration** (10-30%): Cost efficiency
4. **Task-Specific Adjustments**: Specialized capabilities for coding, analysis, etc.
5. **Complexity Adjustments**: Model selection based on task complexity

### Available Models
| Model | Speed | Capability | Cost/1K | Context | Best For |
|-------|-------|------------|---------|---------|----------|
| GPT-4o | 8/10 | 10/10 | $0.03 | 128K | Complex tasks, analysis |
| GPT-4o-mini | 9/10 | 8/10 | $0.00015 | 128K | Fast responses, coding |
| GPT-3.5-turbo | 10/10 | 7/10 | $0.002 | 16K | Simple tasks, speed |
| Claude-3-5-sonnet | 7/10 | 9/10 | $0.015 | 200K | Long context, analysis |

## 🛠️ Available Tools

### Browser Automation (Playwright)
- `browser_navigate` - Navigate to URL
- `browser_click` - Click elements
- `browser_type` - Type text
- `browser_snapshot` - Take page snapshot
- `browser_take_screenshot` - Capture screenshots
- `browser_fill_form` - Fill forms
- `browser_select_option` - Select dropdown options
- `browser_hover` - Hover over elements
- `browser_drag` - Drag and drop
- `browser_press_key` - Press keyboard keys
- `browser_wait_for` - Wait for conditions

### Web Content (Fetch)
- `fetch` - Fetch and extract web content as markdown

### GitHub Integration
- `github_search_repositories` - Search repositories
- `github_get_file_contents` - Get file contents
- `github_create_file` - Create files
- `github_update_file` - Update files
- `github_create_pull_request` - Create PRs
- `github_list_issues` - List issues

## 💬 Usage Examples

### Basic Chat
```javascript
// Send a message to the AI assistant
const response = await fetch('/api/v1/sessions/session-id/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Help me debug this JavaScript function",
    context: { code: "function test() { return x + y; }" }
  })
});

// Handle streaming response
const eventSource = new EventSource('/api/v1/sessions/session-id/chat');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle different event types: message, tool, complete, error
};
```

### Browser Automation
```javascript
// Navigate to a website
await fetch('/api/v1/sessions/session-id/tools/browser_navigate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parameters: { url: 'https://example.com' }
  })
});

// Take a screenshot
await fetch('/api/v1/sessions/session-id/tools/browser_take_screenshot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parameters: { fullPage: true }
  })
});
```

### Tool Discovery
```javascript
// List all available tools
const tools = await fetch('/api/v1/tools').then(r => r.json());

// Get specific tool information
const toolInfo = await fetch('/api/v1/tools/browser_navigate').then(r => r.json());
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your-openai-api-key

# Optional
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token
PORT=8000
MAX_EXECUTION_TIME=5000
```

### Model Configuration
Models can be configured in `backend/app/application/services/ai_service.py`:

```python
"gpt-4o": ModelConfig(
    name="gpt-4o",
    provider="openai",
    max_tokens=4096,
    cost_per_1k_tokens=0.03,
    speed_rating=8,
    capability_rating=10,
    context_window=128000
)
```

## 🚀 Advanced Features

### Real-time Collaboration
- Multiple users can interact with the same session
- Real-time updates via WebSocket
- Shared tool state and browser sessions

### Code Integration
- Execute code directly from chat messages
- Syntax highlighting and formatting
- Error handling and debugging assistance

### File Management
- Attach files to conversations
- Code analysis and suggestions
- Project-wide context awareness

### Performance Monitoring
- Model selection metrics
- Response time tracking
- Cost analysis and optimization

## 🔒 Security

### Sandboxed Execution
- Code runs in isolated VM2 environment
- File system access limited to workspace
- Network access controlled via MCP servers

### API Security
- Input validation and sanitization
- Rate limiting and request throttling
- Secure session management

### MCP Server Isolation
- Docker containers for tool execution
- Process isolation and resource limits
- Automatic cleanup of inactive processes

## 📊 Monitoring and Logging

### Logging
- Structured logging with different levels
- Request/response tracking
- Error monitoring and alerting

### Metrics
- Model selection statistics
- Tool usage patterns
- Performance benchmarks

### Health Checks
- API endpoint health monitoring
- MCP server status checks
- Database connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for developers who want to code faster and smarter with AI assistance.**
