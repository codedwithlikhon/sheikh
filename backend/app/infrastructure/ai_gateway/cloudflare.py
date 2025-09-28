"""
Cloudflare AI Gateway integration module.
This module provides functionality to connect to Cloudflare's AI Gateway
for AI model interactions using both REST and WebSocket APIs.
"""

import os
import json
import asyncio
import httpx
import websockets
from typing import Dict, Any, Optional, List, Union
from fastapi import WebSocket as FastAPIWebSocket

class CloudflareAIGateway:
    """Client for Cloudflare AI Gateway integration."""

    def __init__(self, account_id: str, gateway_id: str, api_key: str):
        """
        Initialize the Cloudflare AI Gateway client.

        Args:
            account_id: Cloudflare account ID
            gateway_id: AI Gateway ID
            api_key: Cloudflare API key with AI Gateway Run permission
        """
        self.account_id = account_id
        self.gateway_id = gateway_id
        self.api_key = api_key
        self.base_url = f"https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}"
        self.ws_base_url = f"wss://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}"

    async def request(self,
                     provider: str,
                     endpoint: str,
                     method: str = "POST",
                     data: Optional[Dict[str, Any]] = None,
                     headers: Optional[Dict[str, str]] = None,
                     gateway_options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make a REST API request to the AI Gateway.

        Args:
            provider: AI provider (e.g., 'openai', 'google', etc.)
            endpoint: API endpoint
            method: HTTP method
            data: Request payload
            headers: Additional headers
            gateway_options: Cloudflare AI Gateway specific options
                - backoff_type: Customize backoff type for request retries
                - cache_key: Override default cache key
                - cache_ttl: Specify cache time-to-live
                - collect_log: Bypass default log setting
                - custom_cost: Customize request cost
                - event_id: Unique identifier for tracing events
                - max_attempts: Customize max retry attempts
                - metadata: Custom metadata for tracking
                - request_timeout: Timeout for fallback provider (ms)
                - retry_delay: Customize retry delay
                - skip_cache: Bypass caching for this request

        Returns:
            Response data
        """
        url = f"{self.base_url}/{provider}/{endpoint}"

        default_headers = {
            "cf-aig-authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # Add Cloudflare AI Gateway specific headers
        if gateway_options:
            if "backoff_type" in gateway_options:
                default_headers["cf-aig-backoff"] = str(gateway_options["backoff_type"])

            if "cache_key" in gateway_options:
                default_headers["cf-aig-cache-key"] = str(gateway_options["cache_key"])

            if "cache_ttl" in gateway_options:
                default_headers["cf-aig-cache-ttl"] = str(gateway_options["cache_ttl"])

            if "collect_log" in gateway_options:
                default_headers["cf-aig-collect-log"] = str(gateway_options["collect_log"]).lower()

            if "custom_cost" in gateway_options:
                default_headers["cf-aig-custom-cost"] = str(gateway_options["custom_cost"])

            if "event_id" in gateway_options:
                default_headers["cf-aig-event-id"] = str(gateway_options["event_id"])

            if "log_id" in gateway_options:
                default_headers["cf-aig-log-id"] = str(gateway_options["log_id"])

            if "max_attempts" in gateway_options:
                default_headers["cf-aig-max-attempts"] = str(gateway_options["max_attempts"])

            if "metadata" in gateway_options:
                metadata = gateway_options["metadata"]
                if isinstance(metadata, dict):
                    default_headers["cf-aig-metadata"] = json.dumps(metadata)
                else:
                    default_headers["cf-aig-metadata"] = str(metadata)

            if "request_timeout" in gateway_options:
                default_headers["cf-aig-request-timeout"] = str(gateway_options["request_timeout"])

            if "retry_delay" in gateway_options:
                default_headers["cf-aig-retry-delay"] = str(gateway_options["retry_delay"])

            if "skip_cache" in gateway_options:
                default_headers["cf-aig-skip-cache"] = str(gateway_options["skip_cache"]).lower()

            if "step" in gateway_options:
                default_headers["cf-aig-step"] = str(gateway_options["step"])

        # User-provided headers take precedence
        if headers:
            default_headers.update(headers)

        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=url,
                json=data,
                headers=default_headers
            )

            response.raise_for_status()
            return response.json()

    async def connect_websocket(self,
                               provider: str,
                               params: Optional[Dict[str, str]] = None,
                               provider_api_key: Optional[str] = None,
                               additional_protocols: Optional[List[str]] = None,
                               gateway_options: Optional[Dict[str, Any]] = None) -> websockets.WebSocketClientProtocol:
        """
        Connect to the AI Gateway using WebSockets.

        Args:
            provider: AI provider (e.g., 'openai', 'google', etc.)
            params: URL query parameters
            provider_api_key: Provider-specific API key
            additional_protocols: Additional WebSocket protocols
            gateway_options: Cloudflare AI Gateway specific options
                - backoff_type: Customize backoff type for request retries
                - cache_key: Override default cache key
                - cache_ttl: Specify cache time-to-live
                - collect_log: Bypass default log setting
                - custom_cost: Customize request cost
                - event_id: Unique identifier for tracing events
                - max_attempts: Customize max retry attempts
                - metadata: Custom metadata for tracking
                - request_timeout: Timeout for fallback provider (ms)
                - retry_delay: Customize retry delay
                - skip_cache: Bypass caching for this request
                - step: Processing step identifier

        Returns:
            WebSocket connection
        """
        # Build URL with query parameters
        url = f"{self.ws_base_url}/{provider}"
        if params:
            query_string = "&".join([f"{k}={v}" for k, v in params.items()])
            url = f"{url}?{query_string}"

        # Set up headers and protocols
        headers = {"cf-aig-authorization": f"Bearer {self.api_key}"}

        # Add Cloudflare AI Gateway specific headers
        if gateway_options:
            for option, value in gateway_options.items():
                header_name = f"cf-aig-{option.replace('_', '-')}"
                if option == "metadata" and isinstance(value, dict):
                    headers[header_name] = json.dumps(value)
                else:
                    headers[header_name] = str(value)

        if provider_api_key:
            if provider == "openai":
                headers["Authorization"] = f"Bearer {provider_api_key}"
                headers["OpenAI-Beta"] = "realtime=v1"
            else:
                # For browser compatibility, some providers use protocols instead of headers
                protocols = [f"cf-aig-authorization.{self.api_key}"]

                if provider == "google":
                    protocols.append(f"api_key.{provider_api_key}")
                elif provider == "elevenlabs":
                    protocols.append(f"xi-api-key.{provider_api_key}")
                elif provider == "fal":
                    protocols.append(f"fal-api-key.{provider_api_key}")
                elif provider == "cartesia":
                    # Cartesia uses query params instead
                    if not params:
                        params = {}
                    params["api_key"] = provider_api_key

                if additional_protocols:
                    protocols.extend(additional_protocols)

                return await websockets.connect(url, subprotocols=protocols)

        # Connect with headers
        return await websockets.connect(url, extra_headers=headers)

    async def proxy_websocket(self,
                             client_ws: FastAPIWebSocket,
                             provider: str,
                             params: Optional[Dict[str, str]] = None,
                             provider_api_key: Optional[str] = None) -> None:
        """
        Proxy WebSocket connections between client and AI Gateway.

        Args:
            client_ws: Client WebSocket connection
            provider: AI provider
            params: URL query parameters
            provider_api_key: Provider-specific API key
        """
        # Connect to Cloudflare AI Gateway
        gateway_ws = await self.connect_websocket(provider, params, provider_api_key)

        # Set up bidirectional communication
        async def forward_to_gateway():
            try:
                while True:
                    message = await client_ws.receive_text()
                    await gateway_ws.send(message)
            except Exception as e:
                print(f"Error forwarding to gateway: {e}")

        async def forward_to_client():
            try:
                while True:
                    message = await gateway_ws.recv()
                    await client_ws.send_text(message)
            except Exception as e:
                print(f"Error forwarding to client: {e}")

        # Run both forwarding tasks concurrently
        forward_tasks = [
            asyncio.create_task(forward_to_gateway()),
            asyncio.create_task(forward_to_client())
        ]

        # Wait for either task to complete (which means a connection was closed)
        done, pending = await asyncio.wait(
            forward_tasks,
            return_when=asyncio.FIRST_COMPLETED
        )

        # Cancel the remaining task
        for task in pending:
            task.cancel()

        # Close connections
        await gateway_ws.close()


# Factory function to create a client from environment variables
def create_client_from_env() -> CloudflareAIGateway:
    """
    Create a CloudflareAIGateway client using environment variables.

    Required environment variables:
    - CLOUDFLARE_ACCOUNT_ID
    - CLOUDFLARE_GATEWAY_ID
    - CLOUDFLARE_API_KEY

    Returns:
        CloudflareAIGateway client
    """
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    gateway_id = os.environ.get("CLOUDFLARE_GATEWAY_ID")
    api_key = os.environ.get("CLOUDFLARE_API_KEY")

    if not all([account_id, gateway_id, api_key]):
        raise ValueError(
            "Missing required environment variables for Cloudflare AI Gateway. "
            "Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_GATEWAY_ID, and CLOUDFLARE_API_KEY."
        )

    return CloudflareAIGateway(account_id, gateway_id, api_key)