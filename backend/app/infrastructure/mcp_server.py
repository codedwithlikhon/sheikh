import subprocess
import json
import os
import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MCPServer:
    """
    Enhanced Model Context Protocol Server manager for handling different MCP servers
    with improved error handling, async support, and tool management
    """
    def __init__(self):
        self.servers = {}
        self.active_processes = {}
        self.tool_registry = {}
        self._register_servers()
        self._register_tools()

    def _register_servers(self):
        """Register all available MCP servers"""
        # Playwright server for browser automation
        self.servers["playwright"] = {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "--network", "host",
                "-v", "/tmp/.X11-unix:/tmp/.X11-unix:rw",
                "-e", "DISPLAY=$DISPLAY",
                "mcp/playwright"
            ],
            "description": "Browser automation with Playwright",
            "tools": [
                "browser_navigate", "browser_click", "browser_type", "browser_snapshot",
                "browser_take_screenshot", "browser_fill_form", "browser_select_option",
                "browser_hover", "browser_drag", "browser_press_key", "browser_wait_for"
            ]
        }

        # Fetch server for web content retrieval
        self.servers["fetch"] = {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "mcp/fetch"
            ],
            "description": "Web content fetching and markdown extraction",
            "tools": ["fetch"]
        }

        # GitHub server for repository operations
        self.servers["github"] = {
            "command": "npx",
            "args": [
                "-y",
                "@modelcontextprotocol/server-github"
            ],
            "env": {
                "GITHUB_PERSONAL_ACCESS_TOKEN": os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN", "")
            },
            "description": "GitHub repository operations",
            "tools": [
                "github_search_repositories", "github_get_file_contents", "github_create_file",
                "github_update_file", "github_create_pull_request", "github_list_issues"
            ]
        }

    def _register_tools(self):
        """Register available tools and their metadata"""
        self.tool_registry = {
            # Browser automation tools
            "browser_navigate": {
                "server": "playwright",
                "description": "Navigate to a URL",
                "parameters": {"url": "string"},
                "category": "browser"
            },
            "browser_click": {
                "server": "playwright",
                "description": "Click on an element",
                "parameters": {"selector": "string", "button": "string (optional)"},
                "category": "browser"
            },
            "browser_type": {
                "server": "playwright",
                "description": "Type text into an input field",
                "parameters": {"selector": "string", "text": "string"},
                "category": "browser"
            },
            "browser_snapshot": {
                "server": "playwright",
                "description": "Take a snapshot of the current page",
                "parameters": {},
                "category": "browser"
            },
            "browser_take_screenshot": {
                "server": "playwright",
                "description": "Take a screenshot of the page or element",
                "parameters": {"selector": "string (optional)", "fullPage": "boolean (optional)"},
                "category": "browser"
            },
            "browser_fill_form": {
                "server": "playwright",
                "description": "Fill out a form with multiple fields",
                "parameters": {"fields": "object"},
                "category": "browser"
            },
            "browser_select_option": {
                "server": "playwright",
                "description": "Select an option from a dropdown",
                "parameters": {"selector": "string", "value": "string"},
                "category": "browser"
            },
            "browser_hover": {
                "server": "playwright",
                "description": "Hover over an element",
                "parameters": {"selector": "string"},
                "category": "browser"
            },
            "browser_drag": {
                "server": "playwright",
                "description": "Drag and drop between elements",
                "parameters": {"from": "string", "to": "string"},
                "category": "browser"
            },
            "browser_press_key": {
                "server": "playwright",
                "description": "Press a key on the keyboard",
                "parameters": {"key": "string"},
                "category": "browser"
            },
            "browser_wait_for": {
                "server": "playwright",
                "description": "Wait for text to appear or disappear",
                "parameters": {"text": "string (optional)", "timeout": "number (optional)"},
                "category": "browser"
            },
            # Web content tools
            "fetch": {
                "server": "fetch",
                "description": "Fetch web content and extract as markdown",
                "parameters": {"url": "string", "max_length": "number (optional)"},
                "category": "web"
            },
            # GitHub tools
            "github_search_repositories": {
                "server": "github",
                "description": "Search for GitHub repositories",
                "parameters": {"query": "string"},
                "category": "github"
            },
            "github_get_file_contents": {
                "server": "github",
                "description": "Get contents of a file from GitHub",
                "parameters": {"owner": "string", "repo": "string", "path": "string"},
                "category": "github"
            }
        }

    def start_server(self, server_name: str) -> str:
        """
        Start an MCP server process with enhanced error handling and monitoring

        Args:
            server_name: Name of the server to start

        Returns:
            process_id: Unique identifier for the started process
        """
        if server_name not in self.servers:
            raise ValueError(f"Server {server_name} not registered")

        config = self.servers[server_name]

        # Prepare environment variables
        env = os.environ.copy()
        if "env" in config:
            env.update(config["env"])

        try:
            process = subprocess.Popen(
                [config["command"]] + config["args"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                env=env
            )

            process_id = f"{server_name}_{id(process)}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            self.active_processes[process_id] = {
                "process": process,
                "server_name": server_name,
                "started_at": datetime.now(),
                "status": "running"
            }

            logger.info(f"Started MCP server {server_name} with process ID {process_id}")
            return process_id

        except Exception as e:
            logger.error(f"Failed to start MCP server {server_name}: {str(e)}")
            raise RuntimeError(f"Failed to start MCP server {server_name}: {str(e)}")

    def get_available_tools(self, category: Optional[str] = None) -> Dict[str, Any]:
        """
        Get available tools, optionally filtered by category

        Args:
            category: Optional category filter (browser, web, github, etc.)

        Returns:
            Dict of available tools
        """
        if category:
            return {name: info for name, info in self.tool_registry.items()
                   if info.get("category") == category}
        return self.tool_registry

    def get_tool_info(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a specific tool

        Args:
            tool_name: Name of the tool

        Returns:
            Tool information or None if not found
        """
        return self.tool_registry.get(tool_name)

    def get_server_status(self, process_id: str) -> Dict[str, Any]:
        """
        Get status of an MCP server process

        Args:
            process_id: Process ID

        Returns:
            Status information
        """
        if process_id not in self.active_processes:
            return {"status": "not_found"}

        process_info = self.active_processes[process_id]
        process = process_info["process"]

        # Check if process is still running
        if process.poll() is None:
            return {
                "status": "running",
                "server_name": process_info["server_name"],
                "started_at": process_info["started_at"].isoformat(),
                "uptime": str(datetime.now() - process_info["started_at"])
            }
        else:
            return {
                "status": "stopped",
                "server_name": process_info["server_name"],
                "started_at": process_info["started_at"].isoformat(),
                "exit_code": process.returncode
            }

    def invoke_tool(self, process_id: str, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Invoke a tool on an MCP server with enhanced error handling

        Args:
            process_id: Process ID of the server
            tool_name: Name of the tool to invoke
            parameters: Parameters for the tool

        Returns:
            result: Tool execution result
        """
        if process_id not in self.active_processes:
            raise ValueError(f"Process {process_id} not found")

        process_info = self.active_processes[process_id]
        process = process_info["process"]

        # Check if process is still running
        if process.poll() is not None:
            raise RuntimeError(f"MCP server process {process_id} has stopped")

        # Validate tool exists
        if tool_name not in self.tool_registry:
            raise ValueError(f"Tool {tool_name} not registered")

        # Validate tool belongs to this server
        tool_info = self.tool_registry[tool_name]
        if tool_info["server"] != process_info["server_name"]:
            raise ValueError(f"Tool {tool_name} does not belong to server {process_info['server_name']}")

        try:
            request = {
                "type": "tool_call",
                "tool": tool_name,
                "parameters": parameters,
                "timestamp": datetime.now().isoformat()
            }

            # Send request to the MCP server
            process.stdin.write(json.dumps(request) + "\n")
            process.stdin.flush()

            # Read response from the MCP server with timeout
            import select
            import sys

            if sys.platform != "win32":
                # Use select for Unix-like systems
                ready, _, _ = select.select([process.stdout], [], [], 30)  # 30 second timeout
                if not ready:
                    raise TimeoutError("Tool invocation timed out")

            response_line = process.stdout.readline()
            if not response_line:
                raise RuntimeError("No response from MCP server")

            response = json.loads(response_line)

            # Add metadata to response
            response["tool_name"] = tool_name
            response["invoked_at"] = datetime.now().isoformat()
            response["process_id"] = process_id

            logger.info(f"Successfully invoked tool {tool_name} on process {process_id}")
            return response

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse response from MCP server: {e}")
            raise RuntimeError(f"Invalid response from MCP server: {e}")
        except Exception as e:
            logger.error(f"Tool invocation failed: {e}")
            raise RuntimeError(f"Tool invocation failed: {e}")

    async def invoke_tool_async(self, process_id: str, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Asynchronously invoke a tool on an MCP server

        Args:
            process_id: Process ID of the server
            tool_name: Name of the tool to invoke
            parameters: Parameters for the tool

        Returns:
            result: Tool execution result
        """
        # Run the synchronous version in a thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.invoke_tool, process_id, tool_name, parameters)

    def stop_server(self, process_id: str) -> None:
        """
        Stop an MCP server process with graceful shutdown

        Args:
            process_id: Process ID of the server to stop
        """
        if process_id not in self.active_processes:
            raise ValueError(f"Process {process_id} not found")

        process_info = self.active_processes[process_id]
        process = process_info["process"]

        try:
            # Try graceful termination first
            process.terminate()
            process.wait(timeout=5)
            logger.info(f"Gracefully stopped MCP server process {process_id}")
        except subprocess.TimeoutExpired:
            # Force kill if graceful shutdown fails
            process.kill()
            process.wait(timeout=2)
            logger.warning(f"Force killed MCP server process {process_id}")
        except Exception as e:
            logger.error(f"Error stopping MCP server process {process_id}: {e}")
        finally:
            del self.active_processes[process_id]

    def cleanup(self) -> None:
        """
        Clean up all active MCP server processes
        """
        logger.info("Cleaning up all MCP server processes...")
        for process_id in list(self.active_processes.keys()):
            try:
                self.stop_server(process_id)
            except Exception as e:
                logger.error(f"Error during cleanup of process {process_id}: {e}")
        logger.info("MCP server cleanup completed")

    def get_all_server_status(self) -> Dict[str, Any]:
        """
        Get status of all active MCP server processes

        Returns:
            Dict mapping process IDs to their status
        """
        return {
            process_id: self.get_server_status(process_id)
            for process_id in self.active_processes.keys()
        }

    def restart_server(self, process_id: str) -> str:
        """
        Restart an MCP server process

        Args:
            process_id: Process ID of the server to restart

        Returns:
            New process ID
        """
        if process_id not in self.active_processes:
            raise ValueError(f"Process {process_id} not found")

        process_info = self.active_processes[process_id]
        server_name = process_info["server_name"]

        # Stop the current process
        self.stop_server(process_id)

        # Start a new process
        return self.start_server(server_name)

# Create a singleton instance
mcp_server = MCPServer()