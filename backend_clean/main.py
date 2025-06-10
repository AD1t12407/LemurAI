"""
Lemur AI - Clean, Structured Backend
Main FastAPI application entry point
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.utils.config import get_settings
from app.core.database import init_database
from app.core.auth import initialize_demo_users
from app.api import auth, clients, files, ai, calendar, bots, debug, meeting_intelligence

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    
    # Initialize database
    if init_database():
        logger.info("✅ Database initialized successfully")

        # Initialize demo users
        await initialize_demo_users()
        logger.info("✅ Demo users initialized")
    else:
        logger.error("❌ Database initialization failed")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down application")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered business intelligence platform for IT consulting firms",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": "development" if settings.debug else "production"
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
        "features": [
            "🔐 User Authentication",
            "🏢 Client Management (Centralized Brain)",
            "📄 Document Processing & Knowledge Base",
            "🤖 AI Content Generation",
            "📅 Google Calendar Integration", 
            "🎥 Meeting Recording (Recall AI)",
            "🔍 Intelligent Search"
        ]
    }


# ============================================================================
# INCLUDE API ROUTES
# ============================================================================

# Authentication routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Client management routes
app.include_router(clients.router, prefix="/clients", tags=["Clients"])

# File and knowledge base routes
app.include_router(files.router, prefix="/files", tags=["Files"])

# AI content generation routes
app.include_router(ai.router, prefix="/ai", tags=["AI"])

# Calendar integration routes
app.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])

# Recall AI bot routes
app.include_router(bots.router, prefix="/bots", tags=["Bots"])

# Meeting Intelligence routes
app.include_router(meeting_intelligence.router, prefix="/meeting-intelligence", tags=["Meeting Intelligence"])

# Debug routes (development only)
app.include_router(debug.router, prefix="/debug", tags=["Debug"])

# Legacy bot routes (for compatibility)
app.include_router(bots.router, prefix="", tags=["Legacy Bots"])


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found",
            "docs": "/docs"
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        }
    )


# ============================================================================
# RUN APPLICATION
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Starting Lemur AI Backend Server...")
    logger.info(f"📖 Documentation: http://{settings.host}:{settings.port}/docs")
    logger.info(f"❤️  Health check: http://{settings.host}:{settings.port}/health")
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
