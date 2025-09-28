# MCP Server Integrations

This document describes the Model Context Protocol (MCP) server integrations implemented in the Sheikh platform.

## Overview

Sheikh now supports two MCP servers:

1. **Playwright MCP Server** - For browser automation and web interaction
2. **Fetch MCP Server** - For retrieving web content

These integrations enable powerful capabilities for agents running on the platform, allowing them to interact with web content and perform browser automation tasks.

## Playwright MCP Server

### Features

The Playwright MCP server provides the following capabilities:

- Navigate to URLs
- Take screenshots
- Click on elements
- Type text into forms
- Capture page snapshots
- Handle dialogs
- Manage browser tabs
- And more

### Implementation

The integration is implemented in `app/services/mcp/playwright_service.py`. The service:

- Manages Docker container lifecycle for the MCP server
- Provides methods to execute Playwright tools
- Handles communication with the MCP server
- Processes results and errors

### Usage Example

```python
from app.services.mcp.playwright_service import PlaywrightMCPService

# Initialize the service
playwright_service = PlaywrightMCPService()

# Start the server
await playwright_service.start_server()

# Navigate to a URL
result = await playwright_service.navigate("https://example.com")

# Take a screenshot
screenshot = await playwright_service.take_screenshot(full_page=True)

# Stop the server when done
await playwright_service.stop_server()
```

## Fetch MCP Server

### Features

The Fetch MCP server provides the ability to:

- Retrieve content from URLs
- Convert HTML to markdown
- Control response size
- Access raw HTML content

### Implementation

The integration is implemented in `app/services/mcp/fetch_service.py`. The service:

- Manages Docker container lifecycle for the MCP server
- Provides methods to fetch web content
- Handles communication with the MCP server
- Processes results and errors

### Usage Example

```python
from app.services.mcp.fetch_service import FetchMCPService

# Initialize the service
fetch_service = FetchMCPService()

# Start the server
await fetch_service.start_server()

# Fetch content from a URL
content = await fetch_service.fetch_url("https://example.com", max_length=10000)

# Stop the server when done
await fetch_service.stop_server()
```

## Frontend Integration

The frontend includes components to interact with these MCP servers:

- `ToolPanel.vue` - Provides UI for executing MCP tools
- `ChatMessage.vue` - Displays results from MCP tools
- `ChatPage.vue` - Integrates the components and handles communication with the backend

## API Endpoints

The MCP server integrations are exposed through the following API endpoints:

- `POST /api/v1/sessions/{session_id}/chat` - For streaming chat responses that may include MCP tool calls
- `POST /api/v1/sessions/{session_id}/tools` - For direct execution of MCP tools

## Docker Configuration

The Docker configuration has been updated to include the necessary dependencies for running MCP servers:

- Docker-in-Docker support
- Pre-pulled MCP server images
- Proper networking configuration

## Security Considerations

When using MCP servers, be aware of the following security considerations:

1. MCP servers run in isolated Docker containers
2. Access to the host system is restricted
3. Network access is controlled
4. User input should be validated before passing to MCP tools

## Troubleshooting

If you encounter issues with MCP server integrations:

1. Check Docker is running and accessible
2. Verify the MCP server images are pulled correctly
3. Check network connectivity
4. Review logs for error messages
5. Ensure proper permissions for Docker operations