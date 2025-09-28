const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');
const { VM } = require('vm2');
const chokidar = require('chokidar');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create workspace directory
const WORKSPACE_DIR = path.join(__dirname, 'workspace');
fs.ensureDirSync(WORKSPACE_DIR);

// WebSocket server
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Store active connections
const connections = new Map();

// File watcher for real-time updates
const watcher = chokidar.watch(WORKSPACE_DIR, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

watcher.on('change', (filePath) => {
  const relativePath = path.relative(WORKSPACE_DIR, filePath);
  broadcastToAll({
    type: 'file_changed',
    path: relativePath,
    content: fs.readFileSync(filePath, 'utf8')
  });
});

// Broadcast to all connected clients
function broadcastToAll(message) {
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  const connectionId = uuidv4();
  connections.set(connectionId, ws);
  
  console.log(`Client connected: ${connectionId}`);
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      await handleWebSocketMessage(ws, data);
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  ws.on('close', () => {
    connections.delete(connectionId);
    console.log(`Client disconnected: ${connectionId}`);
  });
});

// Handle WebSocket messages
async function handleWebSocketMessage(ws, data) {
  const { type, payload } = data;
  
  switch (type) {
    case 'execute_code':
      await executeCode(ws, payload);
      break;
    case 'read_file':
      await readFile(ws, payload);
      break;
    case 'write_file':
      await writeFile(ws, payload);
      break;
    case 'list_files':
      await listFiles(ws, payload);
      break;
    case 'create_file':
      await createFile(ws, payload);
      break;
    case 'delete_file':
      await deleteFile(ws, payload);
      break;
    case 'rename_file':
      await renameFile(ws, payload);
      break;
    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${type}`
      }));
  }
}

// Code execution with sandbox
async function executeCode(ws, { code, language = 'javascript' }) {
  try {
    let result;
    let error = null;
    
    if (language === 'javascript' || language === 'js') {
      // Create a secure VM instance
      const vm = new VM({
        timeout: 5000,
        sandbox: {
          console: {
            log: (...args) => {
              ws.send(JSON.stringify({
                type: 'console_output',
                output: args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ')
              }));
            }
          },
          setTimeout: global.setTimeout,
          setInterval: global.setInterval,
          clearTimeout: global.clearTimeout,
          clearInterval: global.clearInterval
        }
      });
      
      try {
        result = vm.run(code);
        if (result !== undefined) {
          result = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        }
      } catch (vmError) {
        error = vmError.message;
      }
    } else {
      error = `Unsupported language: ${language}`;
    }
    
    ws.send(JSON.stringify({
      type: 'execution_result',
      result,
      error,
      language
    }));
    
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'execution_error',
      error: error.message
    }));
  }
}

// File operations
async function readFile(ws, { filePath }) {
  try {
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    
    ws.send(JSON.stringify({
      type: 'file_content',
      path: filePath,
      content
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to read file: ${error.message}`
    }));
  }
}

async function writeFile(ws, { filePath, content }) {
  try {
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf8');
    
    ws.send(JSON.stringify({
      type: 'file_written',
      path: filePath
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to write file: ${error.message}`
    }));
  }
}

async function listFiles(ws, { directory = '.' } = {}) {
  try {
    const fullPath = path.join(WORKSPACE_DIR, directory);
    const files = await fs.readdir(fullPath, { withFileTypes: true });
    
    const fileList = files.map(file => ({
      name: file.name,
      type: file.isDirectory() ? 'directory' : 'file',
      path: path.join(directory, file.name)
    }));
    
    ws.send(JSON.stringify({
      type: 'file_list',
      files: fileList,
      directory
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to list files: ${error.message}`
    }));
  }
}

async function createFile(ws, { filePath, content = '' }) {
  try {
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf8');
    
    ws.send(JSON.stringify({
      type: 'file_created',
      path: filePath
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to create file: ${error.message}`
    }));
  }
}

async function deleteFile(ws, { filePath }) {
  try {
    const fullPath = path.join(WORKSPACE_DIR, filePath);
    await fs.remove(fullPath);
    
    ws.send(JSON.stringify({
      type: 'file_deleted',
      path: filePath
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to delete file: ${error.message}`
    }));
  }
}

async function renameFile(ws, { oldPath, newPath }) {
  try {
    const oldFullPath = path.join(WORKSPACE_DIR, oldPath);
    const newFullPath = path.join(WORKSPACE_DIR, newPath);
    
    await fs.ensureDir(path.dirname(newFullPath));
    await fs.move(oldFullPath, newFullPath);
    
    ws.send(JSON.stringify({
      type: 'file_renamed',
      oldPath,
      newPath
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to rename file: ${error.message}`
    }));
  }
}

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir(WORKSPACE_DIR, { withFileTypes: true });
    const fileList = files.map(file => ({
      name: file.name,
      type: file.isDirectory() ? 'directory' : 'file'
    }));
    res.json({ files: fileList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 CodeAct AI Agent server running on port ${PORT}`);
  console.log(`📁 Workspace directory: ${WORKSPACE_DIR}`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  watcher.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
