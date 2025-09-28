"""
API routes for Cloudflare AI Gateway integration.
"""

from fastapi import APIRouter, WebSocket, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import json

from ...infrastructure.ai_gateway import CloudflareAIGateway, create_client_from_env

router = APIRouter(prefix="/ai-gateway", tags=["ai-gateway"])

# Dependency to get AI Gateway client
async def get_ai_gateway_client():
    try:
        return create_client_from_env()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/providers/{provider}/completions")
async def proxy_completion_request(
    provider: str,
    request: Request,
    ai_gateway: CloudflareAIGateway = Depends(get_ai_gateway_client)
):
    """
    Proxy completion requests to Cloudflare AI Gateway.
    """
    try:
        # Get request body
        body = await request.json()
        
        # Extract headers that should be forwarded
        headers = {}
        for header in ["OpenAI-Beta", "X-Model-Version"]:
            if header in request.headers:
                headers[header] = request.headers[header]
        
        # Forward request to AI Gateway
        response = await ai_gateway.request(
            provider=provider,
            endpoint="completions",
            data=body,
            headers=headers
        )
        
        return response
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to proxy request: {str(e)}"}
        )

@router.post("/providers/{provider}/chat/completions")
async def proxy_chat_completion_request(
    provider: str,
    request: Request,
    ai_gateway: CloudflareAIGateway = Depends(get_ai_gateway_client)
):
    """
    Proxy chat completion requests to Cloudflare AI Gateway.
    """
    try:
        # Get request body
        body = await request.json()
        
        # Extract headers that should be forwarded
        headers = {}
        for header in ["OpenAI-Beta", "X-Model-Version"]:
            if header in request.headers:
                headers[header] = request.headers[header]
        
        # Forward request to AI Gateway
        response = await ai_gateway.request(
            provider=provider,
            endpoint="chat/completions",
            data=body,
            headers=headers
        )
        
        return response
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to proxy request: {str(e)}"}
        )

@router.websocket("/ws/{provider}")
async def websocket_endpoint(
    websocket: WebSocket,
    provider: str,
    ai_gateway: CloudflareAIGateway = Depends(get_ai_gateway_client)
):
    """
    WebSocket endpoint for real-time AI interactions.
    """
    await websocket.accept()
    
    try:
        # Extract query parameters
        query_params = dict(websocket.query_params)
        
        # Get provider API key from query params or use None
        provider_api_key = query_params.pop("api_key", None)
        
        # Proxy WebSocket connection
        await ai_gateway.proxy_websocket(
            client_ws=websocket,
            provider=provider,
            params=query_params,
            provider_api_key=provider_api_key
        )
    except Exception as e:
        await websocket.close(code=1011, reason=f"Error: {str(e)}")