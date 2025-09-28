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

See the `examples/cloudflare_headers_example.js` file for practical examples of using Cloudflare AI Gateway headers.

## Header Glossary

AI Gateway supports these headers to configure and customize API requests:

| Header | Description |
|--------|-------------|
| `cf-aig-backoff` | Customizes the backoff type for request retries. |
| `cf-aig-cache-key` | Overrides the default cache key for precise cacheability control. |
| `cf-aig-cache-status` | Status indicator showing if a request was served from cache. |
| `cf-aig-cache-ttl` | Specifies the cache time-to-live for responses. |
| `cf-aig-collect-log` | Bypasses the default log setting for the gateway. |
| `cf-aig-custom-cost` | Allows customization of request cost for user-defined parameters. |
| `cf-aig-event-id` | Unique identifier for tracing specific events through the system. |
| `cf-aig-log-id` | Unique identifier for the specific log entry for feedback. |
| `cf-aig-max-attempts` | Customizes the number of max attempts for request retries. |
| `cf-aig-metadata` | Tags requests with user IDs or other identifiers for tracking. |
| `cf-aig-request-timeout` | Triggers fallback provider based on response time (in milliseconds). |
| `cf-aig-retry-delay` | Customizes the retry delay for request retries. |
| `cf-aig-skip-cache` | Bypasses caching for a specific request. |
| `cf-aig-step` | Identifies the processing step in the AI Gateway flow for debugging. |

### Configuration Hierarchy

Settings in AI Gateway can be configured at three levels:

1. **Provider-level headers**: Take precedence over all other configurations.
2. **Request-level headers**: Apply if no provider-level headers are set.
3. **Gateway-level settings**: Act as defaults if no headers are set at other levels.

## Troubleshooting

Common issues and solutions:

1. **Connection Errors**: Verify your Cloudflare credentials and network connectivity.
2. **Authentication Failures**: Ensure both Cloudflare and provider API keys are valid.
3. **Rate Limiting**: Check Cloudflare dashboard for rate limit configurations.

## References

- [Cloudflare AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Google AI Studio Documentation](https://ai.google.dev/docs)