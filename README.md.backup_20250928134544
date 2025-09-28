# Agent

An open-source, production-grade multi-agent chat platform for computer-using agents, proudly crafted by Likhon Sheikh. Built with real-time collaboration features and secure code execution.

## Features

- 🚀 **Real-time Code Execution** - Run JavaScript, TypeScript, Python, and more
- 📁 **File Management** - Create, edit, delete, and organize files
- 🔒 **Secure Sandbox** - Safe code execution environment
- 💻 **Modern Editor** - Monaco Editor with syntax highlighting and IntelliSense
- 🌐 **WebSocket Communication** - Real-time updates and collaboration
- 🎨 **Dark Theme** - VS Code-inspired interface
- 📱 **Responsive Design** - Works on desktop and mobile

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd agent
   npm run install-all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Manual Setup

If you prefer to run the servers separately:

**Backend (Terminal 1):**
```bash
cd server
npm install
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm install
npm run dev
```

## Usage

### Basic Operations

1. **Create a new file** - Click the "New File" button in the sidebar
2. **Write code** - Use the Monaco editor with full IDE features
3. **Run code** - Press `Ctrl+Enter` or click the "Run" button
4. **Save changes** - Press `Ctrl+S` or click the "Save" button
5. **View output** - Check the console panel at the bottom

### Supported Languages

- **JavaScript** - Full ES6+ support
- **TypeScript** - Type checking and IntelliSense
- **Python** - Basic Python execution (requires Python runtime)
- **HTML/CSS** - Web development
- **JSON** - Data formatting and validation
- **Markdown** - Documentation

### File Management

- **Create files** - Right-click in file explorer or use "New File" button
- **Delete files** - Click the trash icon next to files
- **Rename files** - Double-click on file names
- **Organize** - Create folders and drag files

### Keyboard Shortcuts

- `Ctrl+Enter` / `Cmd+Enter` - Execute code
- `Ctrl+S` / `Cmd+S` - Save file
- `Ctrl+N` / `Cmd+N` - New file
- `Ctrl+O` / `Cmd+O` - Open file
- `Ctrl+F` / `Cmd+F` - Find in editor
- `Ctrl+H` / `Cmd+H` - Replace in editor

## Architecture

### Backend (`/server`)

- **Express.js** - REST API and WebSocket server
- **VM2** - Secure JavaScript execution sandbox
- **Chokidar** - File system watching for real-time updates
- **WebSocket** - Real-time communication with frontend

### Frontend (`/client`)

- **React 18** - Modern UI framework
- **Monaco Editor** - VS Code editor component
- **Tailwind CSS** - Utility-first styling
- **WebSocket Client** - Real-time communication

### Security Features

- **Sandboxed Execution** - Code runs in isolated VM2 environment
- **File System Isolation** - Limited to workspace directory
- **Execution Timeouts** - Prevents infinite loops
- **Resource Limits** - Memory and CPU constraints

## API Reference

### WebSocket Messages

#### Client to Server

```javascript
// Execute code
{
  "type": "execute_code",
  "payload": {
    "code": "console.log('Hello World')",
    "language": "javascript"
  }
}

// Read file
{
  "type": "read_file",
  "payload": {
    "filePath": "example.js"
  }
}

// Write file
{
  "type": "write_file",
  "payload": {
    "filePath": "example.js",
    "content": "console.log('Hello World')"
  }
}
```

#### Server to Client

```javascript
// Execution result
{
  "type": "execution_result",
  "result": "Hello World",
  "error": null,
  "language": "javascript"
}

// Console output
{
  "type": "console_output",
  "output": "Hello World"
}

// File changed
{
  "type": "file_changed",
  "path": "example.js",
  "content": "console.log('Updated')"
}
```

### REST API

- `GET /api/health` - Server health check
- `GET /api/files` - List workspace files

## Configuration

### Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=3001
MAX_EXECUTION_TIME=5000
MAX_FILE_SIZE=10485760
WORKSPACE_DIR=./workspace
```

### Editor Settings

The Monaco editor can be customized by modifying the options in `CodeEditor.jsx`:

```javascript
const editorOptions = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: { enabled: false },
  // ... more options
}
```

## Development

### Project Structure

```
agent/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components for AI assistant interface
│   │   ├── services/       # WebSocket service for real-time communication
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── workspace/          # User files and agent workspace
│   ├── index.js            # Main server file
│   └── package.json
├── backend/                # Python backend for agent orchestration
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   └── application/
│   └── requirements.txt
├── package.json            # Root package.json
└── README.md
```

### Adding New Features

1. **New Language Support** - Add to `getLanguageFromFile()` in `CodeEditor.jsx`
2. **New File Types** - Update file icons in `FileExplorer.jsx`
3. **API Endpoints** - Add routes in `server/index.js`
4. **WebSocket Events** - Extend `handleWebSocketMessage()` function

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

**WebSocket Connection Failed**
- Ensure the backend server is running on port 3001
- Check firewall settings
- Verify no other process is using the port

**Code Execution Errors**
- Check the console for detailed error messages
- Ensure code syntax is correct
- Verify the language is supported

**File Operations Not Working**
- Check file permissions in the workspace directory
- Ensure the workspace directory exists
- Verify file paths are correct

### Performance Tips

- Use smaller files for better performance
- Avoid infinite loops in code execution
- Close unused files to free memory
- Use the file watcher sparingly for large projects

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for developers who want to code faster and smarter.**
