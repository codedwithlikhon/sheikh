"""
Main API router for Sheikh Backend v1
"""

from fastapi import APIRouter
from app.api.v1.endpoints import sessions, tasks, executions, health

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"]
)

api_router.include_router(
    sessions.router,
    prefix="/sessions",
    tags=["sessions"]
)

api_router.include_router(
    tasks.router,
    prefix="/tasks",
    tags=["tasks"]
)

api_router.include_router(
    executions.router,
    prefix="/executions",
    tags=["executions"]
)

