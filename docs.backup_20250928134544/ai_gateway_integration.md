# Cloudflare AI Gateway Integration

This document provides information on how to use the Cloudflare AI Gateway integration in the Sheikh project.

## Overview

Cloudflare's AI Gateway allows you to gain visibility and control over your AI applications with features such as:

- Analytics and logging for insights on application usage
- Scaling controls with caching and rate limiting
- Request retries and model fallback capabilities
- Real-time WebSocket API support for low-latency interactions

## Setup

### Environment Configuration

1. Copy `.env.example` to `.env` and fill in your Cloudflare credentials:

```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_GATEWAY_ID=your_gateway_id
CLOUDFLARE_API_KEY=your_api_key
```

2. Add any provider-specific API keys you plan to use:

```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### Backend Integration

The backend includes a Cloudflare AI Gateway module that provides:

- REST API proxy for standard AI provider endpoints
- WebSocket support for real-time AI interactions
- Automatic credential management

### Frontend Integration

The frontend includes a WebSocket client utility for real-time AI interactions:

- `AIGatewayClient.js` - Core WebSocket client
- `AIGatewayChat.jsx` - Example React component

## Usage Examples

### REST API Example

```javascript
// Backend API call
const response = await fetch('/api/v1/ai-gateway/providers/openai/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Hello, how can you help me?' }
    ]
  })
});

const data = await response.json();
console.log(data);
```

### WebSocket Example (Frontend)

```javascript
import { createOpenAIRealtimeClient } from '../utils/AIGatewayClient';

// Create client
const client = createOpenAIRealtimeClient({
  onMessage: (data) => {
    console.log('Received:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
  }
});

// Connect
await client.connect();

// Send message
client.send({
  type: "response.create",
  response: { 
    modalities: ["text"], 
    instructions: "Tell me about AI Gateways" 
  }
});

// Disconnect when done
client.disconnect();
```

## Supported Providers

The integration supports the following AI providers through Cloudflare AI Gateway:

- OpenAI
- Google AI Studio
- Cartesia
- ElevenLabs
- Fal AI

## Advanced Configuration

### Custom Headers

For provider-specific requirements, you can add custom headers:

```javascript
// Backend
const response = await aiGateway.request(
  provider: 'openai',
  endpoint: 'chat/completions',
  data: requestBody,
  headers: {
    'OpenAI-Beta': 'assistants=v1'
  }
);
```

### WebSocket Protocols

For browser environments, WebSocket protocols are used instead of headers:

```javascript
// Frontend
const ws = new WebSocket(url, [
  `cf-aig-authorization.${cloudflareToken}`,
  `xi-api-key.${elevenLabsApiKey}`
]);
```

## Troubleshooting

Common issues and solutions:

1. **Connection Errors**: Verify your Cloudflare credentials and network connectivity.
2. **Authentication Failures**: Ensure both Cloudflare and provider API keys are valid.
3. **Rate Limiting**: Check Cloudflare dashboard for rate limit configurations.

## References

- [Cloudflare AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Google AI Studio Documentation](https://ai.google.dev/docs)