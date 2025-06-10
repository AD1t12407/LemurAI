"""
API routes for Lemur AI
"""

# Import all route modules to make them available
from . import auth, clients, files, ai, calendar, bots, debug

__all__ = [
    "auth",
    "clients",
    "files",
    "ai",
    "calendar",
    "bots",
    "debug"
]
