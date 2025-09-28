/**
 * OpenAI Realtime Integration Example with Cloudflare AI Gateway
 * 
 * This example demonstrates how to use the Cloudflare AI Gateway
 * to connect to OpenAI's realtime API for streaming responses.
 * 
 * Usage:
 * 1. Set environment variables (see .env.example)
 * 2. Run: node openai_realtime.js
 */

const WebSocket = require('ws');
require('dotenv').config();

// Configuration from environment variables
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_GATEWAY_ID = process.env.CLOUDFLARE_GATEWAY_ID;
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validate required environment variables
if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_GATEWAY_ID || !CLOUDFLARE_API_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

// Construct WebSocket URL
const url = `wss://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_GATEWAY_ID}/openai?model=gpt-4o-realtime-preview-2024-12-17`;

// Connect to WebSocket with required headers
const ws = new WebSocket(url, {
  headers: {
    "cf-aig-authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "OpenAI-Beta": "realtime=v1",
  },
});

// Handle WebSocket events
ws.on('open', () => {
  console.log('Connected to Cloudflare AI Gateway');
  
  // Send initial message to OpenAI
  const message = {
    type: "response.create",
    response: { 
      modalities: ["text"], 
      instructions: "Tell me about Cloudflare's AI Gateway and its benefits" 
    }
  };
  
  console.log('Sending message:', JSON.stringify(message, null, 2));
  ws.send(JSON.stringify(message));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    // Handle different message types
    if (message.type === 'text') {
      console.log(`AI: ${message.text}`);
    } else if (message.type === 'content_block_delta' && message.delta?.text) {
      process.stdout.write(message.delta.text);
    } else if (message.type === 'error') {
      console.error('Error:', message.error);
    } else {
      // For debugging other message types
      console.log('Received:', JSON.stringify(message, null, 2));
    }
  } catch (error) {
    console.error('Failed to parse message:', error);
    console.log('Raw message:', data.toString());
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', (code, reason) => {
  console.log(`Connection closed: ${code} - ${reason}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing connection...');
  ws.close();
  process.exit(0);
});