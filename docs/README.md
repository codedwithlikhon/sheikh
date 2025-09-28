# Sheikh - Multi-Agent Chat Platform

Sheikh is an open-source, production-grade multi-agent chat platform for computer-using agents, built with real-time collaboration features and secure code execution.

## Features

- 🚀 **Real-time Code Execution** - Run JavaScript, TypeScript, Python, and more
- 📁 **File Management** - Create, edit, delete, and organize files
- 🔒 **Secure Sandbox** - Safe code execution environment
- 💻 **Modern Editor** - Monaco Editor with syntax highlighting and IntelliSense
- 🌐 **WebSocket Communication** - Real-time updates and collaboration
- 🎨 **Dark Theme** - VS Code-inspired interface
- 📱 **Responsive Design** - Works on desktop and mobile

## Architecture

The project consists of four main components:

1. **Frontend** (Port 5173)
   - React-based UI with Monaco editor
   - Real-time communication with backend

2. **Backend API** (Port 8000)
   - FastAPI service for session management
   - Real-time conversation through SSE

3. **Sandbox** (Ports 8080, 5900, 9222)
   - Secure code execution environment
   - Browser automation with Playwright
   - VNC access for visualization

4. **Mock Server** (Port 3000)
   - Development testing environment
   - API simulation for frontend development

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.8+ (for local development)

### Quick Start

1. Clone the repository:
   ```
   git clone https://github.com/codedwithlikhon/sheikh.git
   cd sheikh
   ```

2. Start the development environment:
   ```
   ./dev.sh
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - API: http://localhost:8000
   - Sandbox: http://localhost:8080
   - VNC: http://localhost:5900 (password: secret)

### Production Build

To build for production:

```
./build.sh
```

## API Reference

The API follows RESTful principles with these main endpoints:

- `PUT /api/v1/sessions` - Create a new session
- `GET /api/v1/sessions/{session_id}` - Get session details
- `GET /api/v1/sessions` - List all sessions
- `POST /api/v1/sessions/{session_id}/chat` - Send a message
- `POST /api/v1/sandbox/execute` - Execute code in sandbox

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0.