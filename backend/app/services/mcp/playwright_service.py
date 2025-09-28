"""
Playwright MCP Server Integration Service
Provides browser automation capabilities through the Playwright MCP server.
"""

import json
import asyncio
import subprocess
from typing import Dict, Any, List, Optional
import structlog

logger = structlog.get_logger(__name__)

class PlaywrightMCPService:
    """Service for interacting with the Playwright MCP server for browser automation."""
    
    def __init__(self):
        """Initialize the Playwright MCP service."""
        self.process = None
        self.config = {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "mcp/playwright"
            ]
        }
    
    async def start_server(self):
        """Start the Playwright MCP server."""
        if self.process:
            logger.warning("Playwright MCP server is already running")
            return
        
        try:
            cmd = [self.config["command"]] + self.config["args"]
            self.process = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            logger.info("Playwright MCP server started successfully")
        except Exception as e:
            logger.error("Failed to start Playwright MCP server", error=str(e))
            raise RuntimeError(f"Failed to start Playwright MCP server: {str(e)}")
    
    async def stop_server(self):
        """Stop the Playwright MCP server."""
        if not self.process:
            logger.warning("Playwright MCP server is not running")
            return
        
        try:
            self.process.terminate()
            await self.process.wait()
            self.process = None
            logger.info("Playwright MCP server stopped successfully")
        except Exception as e:
            logger.error("Failed to stop Playwright MCP server", error=str(e))
            raise RuntimeError(f"Failed to stop Playwright MCP server: {str(e)}")
    
    async def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool on the Playwright MCP server.
        
        Args:
            tool_name: The name of the tool to execute
            params: The parameters to pass to the tool
            
        Returns:
            The result of the tool execution
        """
        if not self.process:
            await self.start_server()
        
        request = {
            "tool": tool_name,
            "params": params
        }
        
        try:
            # Send request to the MCP server
            request_json = json.dumps(request) + "\n"
            self.process.stdin.write(request_json.encode())
            await self.process.stdin.drain()
            
            # Read response from the MCP server
            response_line = await self.process.stdout.readline()
            response = json.loads(response_line.decode())
            
            if "error" in response and response["error"]:
                logger.error("Playwright MCP tool execution failed", 
                             tool=tool_name, error=response["error"])
                return {"success": False, "error": response["error"]}
            
            logger.info("Playwright MCP tool executed successfully", tool=tool_name)
            return {"success": True, "result": response.get("result", {})}
        except Exception as e:
            logger.error("Failed to execute Playwright MCP tool", 
                         tool=tool_name, error=str(e))
            return {"success": False, "error": str(e)}
    
    # Convenience methods for common Playwright operations
    
    async def navigate(self, url: str) -> Dict[str, Any]:
        """Navigate to a URL."""
        return await self.execute_tool("browser_navigate", {"url": url})
    
    async def take_screenshot(self, filename: Optional[str] = None, 
                             full_page: bool = False) -> Dict[str, Any]:
        """Take a screenshot of the current page."""
        params = {}
        if filename:
            params["filename"] = filename
        if full_page:
            params["fullPage"] = True
        return await self.execute_tool("browser_take_screenshot", params)
    
    async def click(self, element: str, ref: str) -> Dict[str, Any]:
        """Click on an element."""
        return await self.execute_tool("browser_click", {
            "element": element,
            "ref": ref
        })
    
    async def type_text(self, element: str, ref: str, text: str, 
                       submit: bool = False) -> Dict[str, Any]:
        """Type text into an element."""
        return await self.execute_tool("browser_type", {
            "element": element,
            "ref": ref,
            "text": text,
            "submit": submit
        })
    
    async def get_snapshot(self) -> Dict[str, Any]:
        """Get a snapshot of the current page."""
        return await self.execute_tool("browser_snapshot", {})

# Create a singleton instance
playwright_service = PlaywrightMCPService()