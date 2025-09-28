"""Compatibility package exposing the Agent UI SDK at the repository root.

This thin wrapper re-exports the public API from ``app.ag_ui`` so that
``import ag_ui`` works both when the project is installed as a package and
when tests are executed directly from the repository root.  The tests in this
repository import ``ag_ui`` as a top-level module, but the actual
implementation lives under ``app.ag_ui`` as part of the FastAPI application.

By providing this lightweight shim we avoid having to modify the tests while
also keeping the application package layout unchanged.
"""

from app.ag_ui import *  # noqa: F401,F403 - re-export everything from the SDK

# Re-export the explicit public interface so tools like static analyzers can
# discover the available symbols without having to inspect ``app.ag_ui``.
from app.ag_ui import __all__  # noqa: F401
