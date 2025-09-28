"""
Custom middleware for Sheikh Backend
"""

from collections import defaultdict, deque
from typing import Dict

import structlog
import time
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

logger = structlog.get_logger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response logging."""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()

        logger.info(
            "Request started",
            method=request.method,
            url=str(request.url),
            client_ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        response = await call_next(request)

        process_time = time.time() - start_time

        logger.info(
            "Request completed",
            method=request.method,
            url=str(request.url),
            status_code=response.status_code,
            process_time=round(process_time, 4),
        )

        response.headers["X-Process-Time"] = str(process_time)
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware with per-IP buckets."""

    def __init__(self, app: ASGIApp, requests_per_minute: int = 100) -> None:
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()

        while self.requests[client_ip] and self.requests[client_ip][0] < current_time - 60:
            self.requests[client_ip].popleft()

        if len(self.requests[client_ip]) >= self.requests_per_minute:
            logger.warning(
                "Rate limit exceeded",
                client_ip=client_ip,
                requests_count=len(self.requests[client_ip]),
            )
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Limit: {self.requests_per_minute} per minute",
                },
            )

        self.requests[client_ip].append(current_time)
        return await call_next(request)

