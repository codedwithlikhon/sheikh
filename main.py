"""Application entry point for Railpack deployments.

This module exposes the FastAPI instance from ``backend.app.main`` and
provides a ``main`` function that starts the Uvicorn server. Railpack looks
for a ``main.py`` file at the project root, so we ensure the backend package
is importable and the app can be launched without additional configuration.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Ensure the ``backend`` package is on the Python path when this file is
# executed directly by the runtime environment.
PROJECT_ROOT = Path(__file__).resolve().parent
BACKEND_DIR = PROJECT_ROOT / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app, run as run_app  # noqa: E402  (import after path setup)


def main() -> None:
    """Launch the FastAPI application using Uvicorn."""
    # Delegate to the backend run helper to keep configuration centralized.
    # ``run_app`` handles reading environment variables and spinning up Uvicorn.
    # We override the reload behaviour here to avoid unexpected restarts in
    # production environments that invoke this entry point.
    os.environ.setdefault("UVICORN_RELOAD", "false")

    reload_flag = os.environ.get("UVICORN_RELOAD", "false").lower() == "true"
    if reload_flag:
        run_app()
    else:
        # Import Uvicorn lazily to avoid unnecessary dependency loading when the
        # application is imported (e.g., during unit tests).
        import uvicorn

        port = int(os.environ.get("PORT", 8000))
        uvicorn.run(app, host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
