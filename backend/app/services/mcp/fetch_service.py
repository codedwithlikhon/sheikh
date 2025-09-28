"""
Fetch MCP Server Integration Service
Provides web content retrieval capabilities through the Fetch MCP server.
"""

import json
import asyncio
from typing import Dict, Any, Optional
import structlog

logger = structlog.get_logger(__name__)

class FetchMCPService:
    """Service for interacting with the Fetch MCP server for web content retrieval."""
    
    def __init__(self):
        """Initialize the Fetch MCP service."""
        self.process = None
        self.config = {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "mcp/fetch"
            ]
        }
    
    async def start_server(self):
        """Start the Fetch MCP server."""
        if self.process:
            logger.warning("Fetch MCP server is already running")
            return
        
        try:
            cmd = [self.config["command"]] + self.config["args"]
            self.process = await asyncio.create_subprocess_exec(
                *cmd,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            logger.info("Fetch MCP server started successfully")
        except Exception as e:
            logger.error("Failed to start Fetch MCP server", error=str(e))
            raise RuntimeError(f"Failed to start Fetch MCP server: {str(e)}")
    
    async def stop_server(self):
        """Stop the Fetch MCP server."""
        if not self.process:
            logger.warning("Fetch MCP server is not running")
            return
        
        try:
            self.process.terminate()
            await self.process.wait()
            self.process = None
            logger.info("Fetch MCP server stopped successfully")
        except Exception as e:
            logger.error("Failed to stop Fetch MCP server", error=str(e))
            raise RuntimeError(f"Failed to stop Fetch MCP server: {str(e)}")
    
    async def fetch_url(self, url: str, max_length: Optional[int] = None, 
                       raw: bool = False, start_index: int = 0) -> Dict[str, Any]:
        """
        Fetch content from a URL.
        
        Args:
            url: The URL to fetch
            max_length: Maximum number of characters to return
            raw: Whether to return the raw HTML content
            start_index: Starting character index for the returned content
            
        Returns:
            The fetched content
        """
        if not self.process:
            await self.start_server()
        
        params = {
            "url": url
        }
        
        if max_length is not None:
            params["max_length"] = max_length
        
        if raw:
            params["raw"] = True
            
        if start_index > 0:
            params["start_index"] = start_index
        
        request = {
            "tool": "fetch",
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
                logger.error("Fetch MCP tool execution failed", 
                             url=url, error=response["error"])
                return {"success": False, "error": response["error"]}
            
            logger.info("URL fetched successfully", url=url)
            return {"success": True, "content": response.get("result", {}).get("content", "")}
        except Exception as e:
            logger.error("Failed to fetch URL", url=url, error=str(e))
            return {"success": False, "error": str(e)}

# Create a singleton instance
fetch_service = FetchMCPService()