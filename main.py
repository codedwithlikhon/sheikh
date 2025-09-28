"""Application entry point for Railpack deployments."""

from __future__ import annotations

import os

from backend.app.main import app, run as run_app

_TRUE_VALUES = {"1", "true", "yes", "on"}


def _env_flag(name: str, default: bool) -> bool:
    """Return the boolean interpretation of environment variable ``name``."""

    value = os.environ.get(name)
    if value is None:
        return default
    return value.lower() in _TRUE_VALUES


def main() -> None:
    """Launch the FastAPI application using the backend run helper."""

    reload_flag = _env_flag("UVICORN_RELOAD", False)
    run_app(reload=reload_flag)


if __name__ == "__main__":
    main()
