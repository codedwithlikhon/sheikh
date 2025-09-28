const express = require('express');
const cors = require('cors');
const { VM } = require('vm2');
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());
app.use(express.json());

// Create workspace directory if it doesn't exist
const workspacePath = path.join(__dirname, 'workspace');
(async () => {
  try {
    await fs.mkdir(workspacePath, { recursive: true });
  } catch (err) {
    console.error('Error creating workspace directory:', err);
  }
})();

// Browser instance
let browser;

// Initialize browser
async function initBrowser() {
  try {
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--remote-debugging-port=9222'],
    });
    console.log('Browser initialized');
  } catch (err) {
    console.error('Failed to initialize browser:', err);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sheikh-sandbox' });
});

// Execute code endpoint
app.post('/execute', async (req, res) => {
  const { code, language } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  
  try {
    let result;
    let error = null;
    
    if (language === 'javascript') {
      // Execute JavaScript in VM2 sandbox
      const vm = new VM({
        timeout: 5000,
        sandbox: {
          console: {
            log: (...args) => console.log(...args),
            error: (...args) => console.error(...args),
            warn: (...args) => console.warn(...args),
            info: (...args) => console.info(...args),
          },
        },
      });
      
      try {
        result = vm.run(code);
      } catch (err) {
        error = err.message;
      }
    } else {
      // For other languages, return an error for now
      error = `Language '${language}' is not supported yet`;
    }
    
    res.json({
      result: result !== undefined ? String(result) : null,
      error,
      language,
    });
  } catch (err) {
    res.status(500).json({ error: 'Execution failed: ' + err.message });
  }
});

// File operations
app.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(workspacePath);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list files: ' + err.message });
  }
});

app.get('/files/:filename', async (req, res) => {
  try {
    const filePath = path.join(workspacePath, req.params.filename);
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content });
  } catch (err) {
    res.status(404).json({ error: 'File not found or could not be read' });
  }
});

app.post('/files/:filename', async (req, res) => {
  try {
    const filePath = path.join(workspacePath, req.params.filename);
    await fs.writeFile(filePath, req.body.content);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write file: ' + err.message });
  }
});

app.delete('/files/:filename', async (req, res) => {
  try {
    const filePath = path.join(workspacePath, req.params.filename);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file: ' + err.message });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sandbox server running on port ${PORT}`);
  initBrowser();
});

// Handle process termination
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});