"""
FastAPI Application for Recall AI Bot Service

This module provides a web API for creating and managing Recall AI meeting recording bots.
It imports the RecallAIBot class from recall_bot.py and exposes it through REST API endpoints.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, HttpUrl, EmailStr
from typing import Optional, Dict, Any
import requests
import uvicorn
from datetime import datetime, timedelta
from RecallAIBot import RecallAIBot
import os
import httpx
import json
import urllib.parse
import hashlib
import secrets
import jwt as pyjwt
from dotenv import load_dotenv
# Google Calendar imports (install with: pip install google-auth google-auth-oauthlib google-api-python-client)
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import Flow
    from googleapiclient.discovery import build
    GOOGLE_LIBRARIES_AVAILABLE = True
except ImportError:
    print("⚠️  WARNING: Google Calendar libraries not installed. Google Calendar integration will be disabled.")
    print("   Install with: pip install google-auth google-auth-oauthlib google-api-python-client")
    GOOGLE_LIBRARIES_AVAILABLE = False

load_dotenv()
RECALL_API_KEY = os.getenv("RECALL_API_KEY")
RECALL_CALENDAR_AUTH_URL = os.getenv("RECALL_CALENDAR_AUTH_URL")

if not RECALL_API_KEY:
    raise ValueError("RECALL_API_KEY environment variable is required")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_OAUTH_BASE_URL = os.getenv("GOOGLE_OAUTH_BASE_URL")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Validate Google credentials
if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    print("⚠️  WARNING: Google OAuth credentials not configured. Google Calendar integration will not work.")
    print("   Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file")

# ============================================================================
# PYDANTIC MODELS - These define the structure of requests and responses
# ============================================================================

class CreateBotRequest(BaseModel):
    """Model for creating a bot - defines what data the client must send"""
    meeting_url: HttpUrl  # Validates that it's a proper URL
    bot_name: Optional[str] = "Meeting Bot"  # Optional field with default value
    api_key: str  # Required field
    
    class Config:
        # Example data for auto-generated documentation
        json_schema_extra = {
            "example": {
                "meeting_url": "https://meet.google.com/abc-defg-hij",
                "bot_name": "My Recording Bot",
                "api_key": "8ce8ca0e7bfd41d98312e400c66911e42eb6189e"
            }
        }


class BotResponse(BaseModel):
    """Model for bot creation response"""
    bot_id: str
    status: str
    message: str
    created_at: datetime


class BotStatusResponse(BaseModel):
    """Model for bot status response"""
    bot_id: str
    status: str
    checked_at: datetime


class DownloadUrlsResponse(BaseModel):
    """Model for download URLs response"""
    bot_id: str
    video_url: Optional[str]
    transcript_url: Optional[str]
    status: str


class ErrorResponse(BaseModel):
    """Model for error responses"""
    error: str
    detail: str
    timestamp: datetime

class CalendarAuthRequest(BaseModel):
    """Model for calendar auth token generation request"""
    user_id: str  # The unique id of the user in your system
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_12345"
            }
        }

class CalendarAuthResponse(BaseModel):
    """Model for calendar auth token response"""
    token: str
    expires_at: str
    user_id: str

class GoogleCalendarConnectionRequest(BaseModel):
    """Model for initiating Google Calendar connection"""
    user_id: str  # The user_id for which to connect calendar
    calendar_auth_token: str  # Token from /calendar/auth-token endpoint (REQUIRED)
    success_url: Optional[str] = None  # URL to redirect after successful connection
    error_url: Optional[str] = None    # URL to redirect after failed connection
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_12345",
                "calendar_auth_token": "your_calendar_auth_token_from_auth_endpoint",
                "success_url": "https://thelemur.ai",
                "error_url": "https://otter.ai"
            }
        }

class GoogleCalendarConnectionResponse(BaseModel):
    """Model for Google Calendar connection initiation response"""
    oauth_url: str  # The URL user should visit to authorize
    state: str      # The state parameter for verification
    message: str    # Instructions for the user

class CalendarConnectionStatus(BaseModel):
    """Model for checking calendar connection status"""
    user_id: str
    connected: bool
    provider: Optional[str] = None
    last_sync: Optional[str] = None

class CalendarEventRequest(BaseModel):
    """Model for creating/updating calendar events"""
    title: str
    description: Optional[str] = None
    start_time: str  # ISO format datetime
    end_time: str    # ISO format datetime
    attendees: Optional[list[str]] = []  # List of email addresses
    meeting_link: Optional[str] = None
    location: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Team Meeting",
                "description": "Weekly team sync",
                "start_time": "2024-01-15T10:00:00Z",
                "end_time": "2024-01-15T11:00:00Z",
                "attendees": ["john@example.com", "jane@example.com"],
                "meeting_link": "https://meet.google.com/abc-defg-hij",
                "location": "Conference Room A"
            }
        }

class CalendarEventResponse(BaseModel):
    """Model for calendar event response"""
    id: str
    title: str
    description: Optional[str] = None
    start_time: str
    end_time: str
    attendees: list[str] = []
    meeting_link: Optional[str] = None
    location: Optional[str] = None
    created_at: str
    updated_at: str
    user_id: str

class CalendarEventsListResponse(BaseModel):
    """Model for calendar events list response"""
    events: list[CalendarEventResponse]
    total_count: int
    start_date: str
    end_date: str

# ============================================================================
# USER AUTHENTICATION MODELS
# ============================================================================

class UserRegistrationRequest(BaseModel):
    """Model for user registration"""
    email: EmailStr
    password: str
    name: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "aditi@synatechsolutions.com",
                "password": "synatech@Aditi",
                "name": "Aditi Sirigineedi"
            }
        }

class UserLoginRequest(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "aditi@synatechsolutions.com",
                "password": "synatech@Aditi"
            }
        }

class UserResponse(BaseModel):
    """Model for user data response"""
    id: str
    email: str
    name: str
    created_at: str
    google_calendar_connected: bool = False

class AuthResponse(BaseModel):
    """Model for authentication response"""
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse


# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

# Create the FastAPI app instance
app = FastAPI(
    title="Recall AI Bot Service",
    description="A web service to create and manage Recall AI meeting recording bots",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI will be available at /docs
    redoc_url="/redoc"  # ReDoc documentation at /redoc
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active bots (in production, use a database)
active_bots: Dict[str, RecallAIBot] = {}

# In-memory storage for user-bot mapping (in production, use a database)
user_bots: Dict[str, list[str]] = {}  # user_id -> list of bot_ids

# In-memory storage for calendar events (in production, use a database)
calendar_events: Dict[str, Dict[str, Any]] = {}  # event_id -> event_data
user_events: Dict[str, list[str]] = {}  # user_id -> list of event_ids

# In-memory storage for users (in production, use a database)
users_db: Dict[str, Dict[str, Any]] = {}  # email -> user_data
user_tokens: Dict[str, str] = {}  # token -> user_id



# In-memory storage for Google Calendar tokens (in production, use a database)
google_tokens: Dict[str, Dict[str, Any]] = {}  # user_id -> google_credentials

# Google Calendar API configuration
GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# Use LOCAL redirect URI for our own Google Calendar integration
LOCAL_GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"
# Use RECALL redirect URI for Recall AI's integration
RECALL_GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI_CALENDAR", "https://us-west-2.recall.ai/api/v1/calendar/google_oauth_callback/")

# Debug: Print the redirect URIs being used
print(f"🔧 LOCAL_GOOGLE_REDIRECT_URI: {LOCAL_GOOGLE_REDIRECT_URI}")
print(f"🔧 RECALL_GOOGLE_REDIRECT_URI: {RECALL_GOOGLE_REDIRECT_URI}")

# Authentication setup
security = HTTPBearer()

# ============================================================================
# AUTHENTICATION UTILITIES
# ============================================================================

def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == hashed_password

def create_access_token(user_id: str) -> str:
    """Create a JWT access token"""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return pyjwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Optional[str]:
    """Verify a JWT token and return user_id"""
    try:
        payload = pyjwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except pyjwt.ExpiredSignatureError:
        return None
    except pyjwt.InvalidTokenError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user from JWT token"""
    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
    return user_id

# ============================================================================
# DEMO USER SETUP
# ============================================================================

def create_demo_users():
    """Create demo users for testing"""
    demo_users = [
        {
            "id": "demo_user_1",
            "email": "demo@lemurai.com",
            "name": "Demo User",
            "password": "demo1234"
        },
        {
            "id": "user_aditi",
            "email": "aditi@synatechsolutions.com",
            "name": "Aditi Sirigineedi",
            "password": "synatech@Aditi"
        },
        {
            "id": "user_aman",
            "email": "amansanghi@synatechsolutions.com",
            "name": "Aman Sanghi",
            "password": "synatech@Aman"
        }
    ]

    for user_info in demo_users:
        email = user_info["email"]
        if email not in users_db:
            user_data = {
                "id": user_info["id"],
                "email": email,
                "name": user_info["name"],
                "password_hash": hash_password(user_info["password"]),
                "created_at": datetime.now().isoformat(),
                "google_calendar_connected": False
            }
            users_db[email] = user_data
            print(f"✅ Demo user created: {email}")

# Create demo users on startup
create_demo_users()

# ============================================================================
# GOOGLE CALENDAR HELPER FUNCTIONS
# ============================================================================

def create_google_oauth_flow():
    """Create Google OAuth flow for calendar access"""
    if not GOOGLE_LIBRARIES_AVAILABLE:
        raise HTTPException(
            status_code=500,
            detail="Google Calendar libraries not installed"
        )

    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth credentials not configured"
        )

    print(f"🔧 Creating OAuth flow with redirect URI: {LOCAL_GOOGLE_REDIRECT_URI}")

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [LOCAL_GOOGLE_REDIRECT_URI]
            }
        },
        scopes=GOOGLE_CALENDAR_SCOPES
    )
    flow.redirect_uri = LOCAL_GOOGLE_REDIRECT_URI
    print(f"✅ OAuth flow created with redirect URI: {flow.redirect_uri}")
    return flow

def get_google_calendar_service(user_id: str):
    """Get Google Calendar service for a user"""
    if not GOOGLE_LIBRARIES_AVAILABLE:
        return None

    if user_id not in google_tokens:
        return None

    token_data = google_tokens[user_id]
    credentials = Credentials(
        token=token_data['access_token'],
        refresh_token=token_data.get('refresh_token'),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET
    )

    # Refresh token if needed
    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
        # Update stored token
        google_tokens[user_id].update({
            'access_token': credentials.token,
            'expires_at': credentials.expiry.isoformat() if credentials.expiry else None
        })

    return build('calendar', 'v3', credentials=credentials)

async def fetch_google_calendar_events_from_recall(user_id: str, start_date: str = None, end_date: str = None):
    """Fetch events from user's Google Calendar via Recall AI Calendar V2 API"""
    try:
        # Check if user has a calendar connection
        if user_id not in google_tokens:
            print(f"❌ No Google Calendar connection for user: {user_id}")
            return []

        # Use Recall AI Calendar V2 API (correct endpoint from documentation)
        recall_api_url = "https://us-east-1.recall.ai/api/v2/calendar-events/"

        # Use RECALL_API_KEY for authentication (not user-specific token)
        headers = {
            "Authorization": f"Token {RECALL_API_KEY}",
            "Content-Type": "application/json"
        }

        # Set default time range if not provided
        if not start_date:
            start_date = datetime.now().isoformat()
        if not end_date:
            end_date = (datetime.now() + timedelta(days=30)).isoformat()

        # Calendar V2 API uses query parameters for filtering
        params = {}
        if start_date:
            params["start_time__gte"] = start_date
        if end_date:
            params["end_time__lte"] = end_date

        print(f"🔍 Fetching calendar events from Recall AI Calendar V2 for user: {user_id}")
        print(f"📡 API URL: {recall_api_url}")
        print(f"📅 Date range: {start_date} to {end_date}")

        async with httpx.AsyncClient() as client:
            response = await client.get(recall_api_url, headers=headers, params=params)

            print(f"📊 Response status: {response.status_code}")

            if response.status_code == 200:
                events_data = response.json()
                print(f"📋 Raw response data: {events_data}")

                # Calendar V2 API returns paginated results
                events = events_data.get('results', [])

                print(f"✅ Fetched {len(events)} events from Recall AI Calendar V2")

                # Convert to our format
                converted_events = []
                for event in events:
                    print(f"🔄 Processing event: {event}")

                    # Extract meeting URL from the event
                    meeting_url = ""
                    if event.get('meeting_url'):
                        meeting_url = event['meeting_url']
                    elif event.get('raw', {}).get('hangoutLink'):
                        meeting_url = event['raw']['hangoutLink']
                    elif event.get('raw', {}).get('location') and 'http' in str(event['raw']['location']):
                        meeting_url = event['raw']['location']

                    converted_event = {
                        'id': f"recall_{event.get('id', '')}",
                        'title': event.get('title', event.get('summary', 'No Title')),
                        'description': event.get('description', ''),
                        'start_time': event.get('start_time', ''),
                        'end_time': event.get('end_time', ''),
                        'attendees': [attendee.get('email', attendee) if isinstance(attendee, dict) else attendee
                                    for attendee in event.get('attendees', [])],
                        'meeting_link': meeting_url,
                        'location': event.get('location', ''),
                        'created_at': event.get('created_at', datetime.now().isoformat()),
                        'updated_at': event.get('updated_at', datetime.now().isoformat()),
                        'user_id': user_id,
                        'source': 'recall_calendar_v2'
                    }
                    converted_events.append(converted_event)

                return converted_events

            elif response.status_code == 401:
                print(f"❌ Unauthorized (401) - Check RECALL_API_KEY")
                print(f"📄 Response: {response.text}")
            elif response.status_code == 404:
                print(f"❌ Calendar events endpoint not found (404)")
                print(f"📄 Response: {response.text}")
            else:
                print(f"❌ API call failed with status {response.status_code}")
                print(f"📄 Response: {response.text[:200]}...")

        print(f"❌ Failed to fetch events from Recall AI Calendar V2")
        return []

    except Exception as e:
        print(f"❌ Error fetching calendar events from Recall AI: {e}")
        return []


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """
    Welcome endpoint - shows basic info about the service.
    
    Returns information about the service including documentation links
    and current number of active bots.
    """
    return {
        "message": "Welcome to Recall AI Bot Service",
        "description": "Create and manage meeting recording bots",
        "documentation": "/docs",
        "alternative_docs": "/redoc",
        "health_check": "/health",
        "active_bots": len(active_bots),
        "endpoints": {
            "create_bot": "POST /create-bot",
            "bot_status": "GET /bot/{bot_id}/status",
            "download_urls": "GET /bot/{bot_id}/download-urls",
            "list_bots": "GET /bots",
            "cleanup_bots": "POST /bots/cleanup",
            "remove_bot": "DELETE /bot/{bot_id}",
            "calendar_auth_token": "POST /calendar/auth-token",
            "google_calendar_connect": "POST /calendar/connect/google",
            "calendar_status": "GET /calendar/status/{user_id}",
            "get_calendar_events": "GET /calendar/events/{user_id}",
            "create_calendar_event": "POST /calendar/events",
            "update_calendar_event": "PUT /calendar/events/{event_id}",
            "delete_calendar_event": "DELETE /calendar/events/{event_id}",
            "user_register": "POST /auth/register",
            "user_login": "POST /auth/login",
            "user_profile": "GET /auth/me",
            "google_calendar_auth": "GET /auth/google/calendar",
            "google_calendar_callback": "GET /auth/google/callback",
            "google_calendar_events": "GET /calendar/google-events/{user_id}",
            "upcoming_meetings": "GET /calendar/upcoming/{user_id}",
            "previous_meetings": "GET /calendar/previous/{user_id}"
        }
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint - useful for monitoring and load balancers.

    Returns the current health status of the service.
    """
    return {
        "status": "healthy",
        "service": "Recall AI Bot Service",
        "timestamp": datetime.now(),
        "active_bots": len(active_bots),
        "uptime": "Service is running"
    }

@app.get("/debug/users")
async def debug_users():
    """Debug endpoint to check registered users"""
    return {
        "total_users": len(users_db),
        "users": [{"email": email, "id": data["id"], "name": data["name"]} for email, data in users_db.items()]
    }

@app.get("/debug/test")
async def debug_test():
    """Simple test endpoint for frontend connectivity"""
    return {
        "message": "Frontend can reach backend!",
        "timestamp": datetime.now().isoformat(),
        "users_count": len(users_db)
    }

@app.get("/debug/google-tokens")
async def debug_google_tokens():
    """Debug endpoint to check Google tokens"""
    return {
        "total_connected_users": len(google_tokens),
        "connected_users": list(google_tokens.keys()),
        "token_details": {
            user_id: {
                "has_access_token": bool(data.get("access_token")),
                "has_refresh_token": bool(data.get("refresh_token")),
                "has_recall_token": bool(data.get("recall_auth_token")),
                "expires_at": data.get("expires_at"),
                "scopes": data.get("scopes", [])
            }
            for user_id, data in google_tokens.items()
        }
    }

@app.post("/debug/connect-user/{user_id}")
async def manually_connect_user(user_id: str, current_user_id: str = Depends(get_current_user)):
    """Manually mark a user as connected to Google Calendar (for testing)"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Can only connect your own account")

    # Generate a calendar auth token for this user
    try:
        calendar_auth_token = await generate_calendar_auth_token(CalendarAuthRequest(user_id=user_id))

        # Mark user as connected with the auth token
        google_tokens[user_id] = {
            'recall_auth_token': calendar_auth_token.token,
            'connected_at': datetime.now().isoformat(),
            'source': 'manual_connection'
        }

        # Update user's connection status
        for email, user_data in users_db.items():
            if user_data['id'] == user_id:
                user_data['google_calendar_connected'] = True
                break

        return {
            "message": f"User {user_id} manually connected to Google Calendar",
            "auth_token": calendar_auth_token.token,
            "connected": True
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect user: {str(e)}"
        )

# ============================================================================
# USER AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/auth/register", response_model=AuthResponse)
async def register_user(request: UserRegistrationRequest):
    """
    Register a new user account.

    Args:
        request: User registration data (email, password, name)

    Returns:
        AuthResponse: Access token and user information

    Raises:
        HTTPException: 400 if user already exists
    """
    print(f"🔍 Registration attempt: {request.email}, {request.name}")

    # Check if user already exists
    if request.email in users_db:
        print(f"❌ User already exists: {request.email}")
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )

    # Create user ID
    user_id = f"user_{len(users_db) + 1}"
    print(f"🆔 Generated user ID: {user_id}")

    # Hash password
    hashed_password = hash_password(request.password)
    print(f"🔐 Password hashed successfully")

    # Create user record
    user_data = {
        "id": user_id,
        "email": request.email,
        "name": request.name,
        "password_hash": hashed_password,
        "created_at": datetime.now().isoformat(),
        "google_calendar_connected": False
    }
    print(f"📝 User data created: {user_data['email']}")

    # Store user
    users_db[request.email] = user_data
    print(f"💾 User stored in database. Total users: {len(users_db)}")

    # Create access token
    access_token = create_access_token(user_id)

    # Create response
    user_response = UserResponse(
        id=user_id,
        email=request.email,
        name=request.name,
        created_at=user_data["created_at"],
        google_calendar_connected=False
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=JWT_EXPIRATION_HOURS * 3600,  # Convert to seconds
        user=user_response
    )

@app.post("/auth/login", response_model=AuthResponse)
async def login_user(request: UserLoginRequest):
    """
    Login with email and password.

    Args:
        request: User login credentials

    Returns:
        AuthResponse: Access token and user information

    Raises:
        HTTPException: 401 if invalid credentials
    """
    print(f"🔍 Login attempt: {request.email}")
    print(f"📧 Available users: {list(users_db.keys())}")

    # Check if user exists
    if request.email not in users_db:
        print(f"❌ User not found: {request.email}")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    user_data = users_db[request.email]
    print(f"✅ User found: {request.email}")

    # Verify password
    password_valid = verify_password(request.password, user_data["password_hash"])
    print(f"🔐 Password verification: {password_valid}")

    if not password_valid:
        print(f"❌ Invalid password for: {request.email}")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create access token
    access_token = create_access_token(user_data["id"])

    # Create response
    user_response = UserResponse(
        id=user_data["id"],
        email=user_data["email"],
        name=user_data["name"],
        created_at=user_data["created_at"],
        google_calendar_connected=user_data.get("google_calendar_connected", False)
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=JWT_EXPIRATION_HOURS * 3600,
        user=user_response
    )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user_id: str = Depends(get_current_user)):
    """
    Get current user profile information.

    Args:
        current_user_id: User ID from JWT token

    Returns:
        UserResponse: Current user information

    Raises:
        HTTPException: 404 if user not found
    """
    # Find user by ID
    user_data = None
    for email, data in users_db.items():
        if data["id"] == current_user_id:
            user_data = data
            break

    if not user_data:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return UserResponse(
        id=user_data["id"],
        email=user_data["email"],
        name=user_data["name"],
        created_at=user_data["created_at"],
        google_calendar_connected=user_data.get("google_calendar_connected", False)
    )

# ============================================================================
# GOOGLE CALENDAR OAUTH ENDPOINTS
# ============================================================================

@app.get("/auth/google/calendar")
async def initiate_google_calendar_oauth(current_user_id: str = Depends(get_current_user)):
    """
    Initiate Google Calendar OAuth flow using Recall AI's format.

    Returns:
        dict: OAuth authorization URL
    """
    try:
        # First, generate a calendar auth token for this user
        calendar_auth_token = await generate_calendar_auth_token(CalendarAuthRequest(user_id=current_user_id))

        # Create state parameter in Recall AI's expected JSON format
        state_data = {
            "recall_calendar_auth_token": calendar_auth_token.token,
            "google_oauth_redirect_url": RECALL_GOOGLE_REDIRECT_URI,
            "user_id": current_user_id  # Add our user ID for tracking
        }

        # Convert state to JSON string (compact format)
        state_json = json.dumps(state_data, separators=(',', ':'))
        print(f"📋 State JSON for Recall AI: {state_json}")

        # Store state with user_id for verification (using JSON as key)
        user_tokens[state_json] = current_user_id

        # Build OAuth URL manually with Recall AI's expected format
        oauth_params = {
            "response_type": "code",
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": RECALL_GOOGLE_REDIRECT_URI,
            "scope": "https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.email",
            "state": state_json,
            "access_type": "offline",
            "include_granted_scopes": "true",
            "prompt": "consent"
        }

        # Build the URL
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params_str = "&".join([f"{k}={urllib.parse.quote(str(v), safe='')}" for k, v in oauth_params.items()])
        authorization_url = f"{base_url}?{params_str}"

        print(f"🔗 Recall AI OAuth URL generated: {authorization_url}")

        return {
            "authorization_url": authorization_url,
            "state": state_json,
            "message": "Visit the authorization URL to connect your Google Calendar via Recall AI"
        }

    except Exception as e:
        print(f"❌ OAuth initiation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initiate OAuth flow: {str(e)}"
        )

@app.get("/auth/google/callback")
async def google_calendar_oauth_callback(code: str = None, state: str = None, error: str = None):
    """
    Handle Google Calendar OAuth callback.

    Args:
        code: Authorization code from Google
        state: State parameter for security verification
        error: Error parameter if OAuth failed

    Returns:
        dict: Success message or redirect to frontend
    """
    try:
        print(f"🔄 OAuth callback received - code: {bool(code)}, state: {state}, error: {error}")

        # Check for OAuth errors
        if error:
            print(f"❌ OAuth error: {error}")
            return {
                "error": error,
                "message": f"OAuth authorization failed: {error}",
                "redirect_url": "http://localhost:5173/settings?calendar_error=true"
            }

        if not code or not state:
            print(f"❌ Missing parameters - code: {bool(code)}, state: {bool(state)}")
            raise HTTPException(
                status_code=400,
                detail="Missing code or state parameter"
            )

        # Parse state parameter (should be JSON from Recall AI format)
        try:
            state_data = json.loads(state)
            user_id = state_data.get("user_id")
            print(f"📋 Parsed state data: {state_data}")
        except json.JSONDecodeError:
            print(f"❌ Invalid JSON state: {state}")
            raise HTTPException(
                status_code=400,
                detail="Invalid state parameter format"
            )

        # Verify state parameter exists in our tracking
        if state not in user_tokens:
            print(f"❌ State not found in tracking: {state}")
            print(f"🔍 Available states: {list(user_tokens.keys())}")
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired state parameter"
            )

        # Clean up state tracking
        del user_tokens[state]
        print(f"✅ State verified for user: {user_id}")

        # Exchange code for tokens
        flow = create_google_oauth_flow()
        flow.fetch_token(code=code)

        credentials = flow.credentials
        print(f"✅ Tokens obtained for user: {user_id}")

        # Store tokens for user (including Recall auth token from state)
        recall_auth_token = state_data.get("recall_calendar_auth_token")
        google_tokens[user_id] = {
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'expires_at': credentials.expiry.isoformat() if credentials.expiry else None,
            'scopes': credentials.scopes,
            'recall_auth_token': recall_auth_token  # Store Recall auth token for API calls
        }

        # Update user's Google Calendar connection status
        for email, user_data in users_db.items():
            if user_data['id'] == user_id:
                user_data['google_calendar_connected'] = True
                print(f"✅ Updated connection status for: {email}")
                break

        # Return HTML that redirects to frontend with success
        return {
            "message": "Google Calendar connected successfully!",
            "user_id": user_id,
            "connected": True,
            "redirect_url": "http://localhost:5173/settings?calendar_success=true"
        }

    except Exception as e:
        print(f"❌ OAuth callback error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to complete OAuth flow: {str(e)}"
        )

@app.get("/calendar/google-events/{user_id}")
async def get_google_calendar_events(
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user_id: str = Depends(get_current_user)
):
    """
    Get Google Calendar events for a user.

    Args:
        user_id: The user ID to get events for
        start_date: Start date in ISO format (optional)
        end_date: End date in ISO format (optional)
        current_user_id: Current authenticated user

    Returns:
        dict: Google Calendar events
    """

    # Check if user is requesting their own events or has permission
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own calendar events"
        )

    if user_id not in google_tokens:
        raise HTTPException(
            status_code=404,
            detail="Google Calendar not connected for this user"
        )

    try:
        google_events = await fetch_google_calendar_events_from_recall(user_id, start_date, end_date)

        return {
            "events": google_events,
            "total_count": len(google_events),
            "start_date": start_date or "",
            "end_date": end_date or "",
            "source": "google_calendar"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Google Calendar events: {str(e)}"
        )

@app.get("/calendar/upcoming/{user_id}")
async def get_upcoming_meetings(
    user_id: str,
    limit: Optional[int] = 10,
    current_user_id: str = Depends(get_current_user)
):
    """
    Get upcoming meetings for a user (both local and Google Calendar events).

    Args:
        user_id: The user ID to get meetings for
        limit: Maximum number of meetings to return (default: 10)
        current_user_id: Current authenticated user

    Returns:
        dict: Upcoming meetings sorted by start time
    """

    # Check if user is requesting their own events or has permission
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own meetings"
        )

    try:
        now = datetime.now()

        # Get all events from now onwards
        start_date = now.isoformat()
        end_date = (now + timedelta(days=90)).isoformat()  # Next 3 months

        # Get local events
        user_event_ids = user_events.get(user_id, [])
        events = []

        for event_id in user_event_ids:
            if event_id in calendar_events:
                event_data = calendar_events[event_id]
                event_start = datetime.fromisoformat(event_data['start_time'].replace('Z', '+00:00'))

                # Only include future events
                if event_start > now:
                    events.append(CalendarEventResponse(**event_data))

        # Get Google Calendar events
        google_events = await fetch_google_calendar_events_from_recall(user_id, start_date, end_date)
        for google_event in google_events:
            event_start = datetime.fromisoformat(google_event['start_time'].replace('Z', '+00:00'))
            if event_start > now:
                events.append(CalendarEventResponse(**google_event))

        # Sort by start time and limit results
        events.sort(key=lambda x: x.start_time)
        events = events[:limit] if limit else events

        return {
            "meetings": events,
            "total_count": len(events),
            "type": "upcoming",
            "fetched_at": now.isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get upcoming meetings: {str(e)}"
        )

@app.get("/calendar/previous/{user_id}")
async def get_previous_meetings(
    user_id: str,
    limit: Optional[int] = 10,
    current_user_id: str = Depends(get_current_user)
):
    """
    Get previous meetings for a user (both local and Google Calendar events).

    Args:
        user_id: The user ID to get meetings for
        limit: Maximum number of meetings to return (default: 10)
        current_user_id: Current authenticated user

    Returns:
        dict: Previous meetings sorted by start time (most recent first)
    """

    # Check if user is requesting their own events or has permission
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own meetings"
        )

    try:
        now = datetime.now()

        # Get events from past 6 months to now
        start_date = (now - timedelta(days=180)).isoformat()
        end_date = now.isoformat()

        # Get local events
        user_event_ids = user_events.get(user_id, [])
        events = []

        for event_id in user_event_ids:
            if event_id in calendar_events:
                event_data = calendar_events[event_id]
                event_start = datetime.fromisoformat(event_data['start_time'].replace('Z', '+00:00'))

                # Only include past events
                if event_start < now:
                    events.append(CalendarEventResponse(**event_data))

        # Get Google Calendar events
        google_events = await fetch_google_calendar_events_from_recall(user_id, start_date, end_date)
        for google_event in google_events:
            event_start = datetime.fromisoformat(google_event['start_time'].replace('Z', '+00:00'))
            if event_start < now:
                events.append(CalendarEventResponse(**google_event))

        # Sort by start time (most recent first) and limit results
        events.sort(key=lambda x: x.start_time, reverse=True)
        events = events[:limit] if limit else events

        return {
            "meetings": events,
            "total_count": len(events),
            "type": "previous",
            "fetched_at": now.isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get previous meetings: {str(e)}"
        )


@app.post("/create-bot", response_model=BotResponse)
async def create_bot(request: CreateBotRequest, current_user_id: str = Depends(get_current_user)):
    """
    Create a new recording bot for a meeting.
    
    This endpoint:
    1. Creates a new RecallAI bot instance with the provided API key
    2. Sends the bot to join the specified meeting URL
    3. Stores the bot instance for later operations (status checks, downloads)
    4. Returns the bot ID, current status, and creation details
    
    Args:
        request (CreateBotRequest): Contains meeting_url, api_key, and optional bot_name
        
    Returns:
        BotResponse: Bot ID, status, message, and creation timestamp
        
    Raises:
        HTTPException: 400 if Recall AI API error, 500 if internal server error
    """
    try:
        # Create a new bot instance using your RecallAIBot class
        bot = RecallAIBot(request.api_key)
        
        # Create the bot and get bot_id using your create_bot method
        bot_id = bot.create_bot(str(request.meeting_url), request.bot_name)
        
        # Store the bot instance for later use
        active_bots[bot_id] = bot

        # Track which user owns this bot
        if current_user_id not in user_bots:
            user_bots[current_user_id] = []
        user_bots[current_user_id].append(bot_id)
        
        # Get current status using your get_bot_status method
        status = bot.get_bot_status()
        
        return BotResponse(
            bot_id=bot_id,
            status=status,
            message=f"Bot '{request.bot_name}' created successfully and joining meeting: {request.meeting_url}",
            created_at=datetime.now()
        )
        
    except requests.exceptions.RequestException as e:
        # Handle API errors from Recall AI
        raise HTTPException(
            status_code=400, 
            detail=f"Recall AI API error: {str(e)}"
        )
    except Exception as e:
        # Handle any other errors
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/bot/{bot_id}/status", response_model=BotStatusResponse)
async def get_bot_status(bot_id: str, current_user_id: str = Depends(get_current_user)):
    """
    Get the current status of a specific bot.
    
    Possible status values:
    - 'joining': Bot is attempting to join the meeting
    - 'recording': Bot is actively recording the meeting
    - 'done': Recording is complete and files are available
    - 'fatal': Bot failed to join or encountered an error
    
    Args:
        bot_id (str): The ID of the bot to check
        
    Returns:
        BotStatusResponse: Bot ID, current status, and check timestamp
        
    Raises:
        HTTPException: 404 if bot not found, 500 if error checking status
    """
    if bot_id not in active_bots:
        # Return a proper response instead of 404 to stop frontend polling
        return BotStatusResponse(
            bot_id=bot_id,
            status="not_found",
            checked_at=datetime.now()
        )

    # Check if user owns this bot
    user_bot_ids = user_bots.get(current_user_id, [])
    if bot_id not in user_bot_ids:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own bots"
        )
    
    try:
        bot = active_bots[bot_id]
        # Use your get_bot_status method
        status = bot.get_bot_status()
        
        return BotStatusResponse(
            bot_id=bot_id,
            status=status,
            checked_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error checking bot status: {str(e)}"
        )


@app.get("/bot/{bot_id}/download-urls", response_model=DownloadUrlsResponse)
async def get_download_urls(bot_id: str, current_user_id: str = Depends(get_current_user)):
    """
    Get download URLs for video and transcript (only works when recording is complete).
    
    This endpoint returns the download URLs for both video and transcript files.
    URLs are only available when the bot status is 'done'.
    
    Args:
        bot_id (str): The ID of the bot to get download URLs for
        
    Returns:
        DownloadUrlsResponse: Bot ID, video URL, transcript URL, and current status
        
    Raises:
        HTTPException: 404 if bot not found, 400 if recording not complete, 500 if server error
    """
    if bot_id not in active_bots:
        raise HTTPException(
            status_code=404,
            detail=f"Bot {bot_id} not found. Use POST /create-bot to create a new bot."
        )

    # Check if user owns this bot
    user_bot_ids = user_bots.get(current_user_id, [])
    if bot_id not in user_bot_ids:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own bots"
        )
    
    try:
        bot = active_bots[bot_id]
        # Use your get_bot_status method
        status = bot.get_bot_status()
        
        if status != 'done':
            raise HTTPException(
                status_code=400, 
                detail=f"Recording not complete. Current status: {status}. Please wait for status to be 'done'."
            )
        
        # Get full bot data using your new get_bot_data method
        bot_data = bot.get_bot_data(force_refresh=True)  # Force refresh to get latest data
        
        # Extract download URLs using your extract_download_urls method
        video_url, transcript_url = bot.extract_download_urls(bot_data)
        
        return DownloadUrlsResponse(
            bot_id=bot_id,
            video_url=video_url,
            transcript_url=transcript_url,
            status=status
        )
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error getting download URLs: {str(e)}"
        )


@app.delete("/bot/{bot_id}")
async def remove_bot(bot_id: str, current_user_id: str = Depends(get_current_user)):
    """
    Remove a bot from active tracking (cleanup).
    
    This removes the bot from our internal tracking system. It does NOT
    stop the actual recording - the bot will continue recording until
    the meeting ends naturally.
    
    Args:
        bot_id (str): The ID of the bot to remove from tracking
        
    Returns:
        dict: Confirmation message and timestamp
        
    Raises:
        HTTPException: 404 if bot not found
    """
    if bot_id not in active_bots:
        raise HTTPException(
            status_code=404,
            detail=f"Bot {bot_id} not found in active tracking."
        )

    # Check if user owns this bot
    user_bot_ids = user_bots.get(current_user_id, [])
    if bot_id not in user_bot_ids:
        raise HTTPException(
            status_code=403,
            detail="You can only remove your own bots"
        )
    
    # Remove from our tracking
    del active_bots[bot_id]

    # Remove from user's bot list
    if current_user_id in user_bots and bot_id in user_bots[current_user_id]:
        user_bots[current_user_id].remove(bot_id)
    
    return {
        "message": f"Bot {bot_id} removed from tracking",
        "note": "The actual recording will continue until the meeting ends",
        "timestamp": datetime.now()
    }


@app.get("/bots")
async def list_active_bots(current_user_id: str = Depends(get_current_user)):
    """
    List all currently tracked bots and their statuses.
    
    This endpoint is useful for monitoring multiple recordings and
    checking the overall status of your recording operations.
    
    Returns:
        dict: List of all active bots with their current statuses
    """
    # Get user's bots only
    user_bot_ids = user_bots.get(current_user_id, [])

    if not user_bot_ids:
        return {
            "message": "No active bots currently being tracked for your account",
            "total_bots": 0,
            "bots": [],
            "timestamp": datetime.now()
        }

    bot_list = []
    for bot_id in user_bot_ids:
        if bot_id in active_bots:
            bot = active_bots[bot_id]
        try:
            # Use your get_bot_status method
            status = bot.get_bot_status()
            bot_list.append({
                "bot_id": bot_id,
                "status": status,
                "last_checked": datetime.now()
            })
        except Exception as e:
            bot_list.append({
                "bot_id": bot_id,
                "status": "error",
                "error": str(e),
                "last_checked": datetime.now()
            })
    
    return {
        "message": f"Found {len(bot_list)} active bots",
        "total_bots": len(bot_list),
        "bots": bot_list,
        "timestamp": datetime.now()
    }

@app.post("/bots/cleanup")
async def cleanup_old_bots(current_user_id: str = Depends(get_current_user)):
    """
    Clean up old/stale bots from tracking.

    This endpoint removes bots that are no longer active or have completed
    their recordings from the internal tracking system.

    Returns:
        dict: Cleanup results and statistics
    """
    # Get user's bots only
    user_bot_ids = user_bots.get(current_user_id, [])

    if not user_bot_ids:
        return {
            "message": "No bots to clean up for your account",
            "cleaned_bots": 0,
            "remaining_bots": 0,
            "timestamp": datetime.now()
        }

    cleaned_bots = []
    remaining_bots = []

    for bot_id in list(user_bot_ids):
        if bot_id in active_bots:
            bot = active_bots[bot_id]
            try:
                # Check bot status
                status = bot.get_bot_status()

                # Remove bots that are done or failed
                if status in ['done', 'fatal']:
                    cleaned_bots.append({
                        "bot_id": bot_id,
                        "status": status,
                        "reason": "Recording completed or failed"
                    })
                    del active_bots[bot_id]
                    user_bots[current_user_id].remove(bot_id)
                else:
                    remaining_bots.append({
                        "bot_id": bot_id,
                        "status": status
                    })

            except Exception as e:
                # Remove bots that can't be checked (likely deleted from Recall AI)
                cleaned_bots.append({
                    "bot_id": bot_id,
                    "status": "error",
                    "reason": f"Failed to check status: {str(e)}"
                })
                del active_bots[bot_id]
                user_bots[current_user_id].remove(bot_id)
        else:
            # Bot not in active_bots anymore, clean it up from user_bots
            cleaned_bots.append({
                "bot_id": bot_id,
                "status": "missing",
                "reason": "Bot no longer in active tracking"
            })
            user_bots[current_user_id].remove(bot_id)

    return {
        "message": f"Cleaned up {len(cleaned_bots)} bots, {len(remaining_bots)} remaining",
        "cleaned_bots": len(cleaned_bots),
        "remaining_bots": len(remaining_bots),
        "cleanup_details": cleaned_bots,
        "remaining_details": remaining_bots,
        "timestamp": datetime.now()
    }

@app.post("/calendar/auth-token", response_model=CalendarAuthResponse)
async def generate_calendar_auth_token(request: CalendarAuthRequest, current_user_id: str = Depends(get_current_user)):
    """
    Generate a calendar authentication token for a user.
    
    This is a secure proxy endpoint that calls Recall's calendar auth API
    without exposing your API key to the client. The token is used for all
    subsequent calendar API calls and expires in 24 hours.
    
    Args:
        request (CalendarAuthRequest): Contains user_id (must be consistent for the same user)
        
    Returns:
        CalendarAuthResponse: Token, expiry information, and user_id
        
    Raises:
        HTTPException: 400 if invalid request, 500 if server error
    """
    
    # Validate user_id
    if not request.user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="user_id cannot be empty"
        )

    # Ensure user can only generate tokens for themselves
    if request.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only generate calendar auth tokens for your own account"
        )
    
    # Prepare headers for Recall API
    headers = {
        "Authorization": f"Token {RECALL_API_KEY}",
        "accept": "application/json",
        "content-type": "application/json"
    }
    
    # Prepare request body
    payload = {
        "user_id": request.user_id.strip()
    }
    
    try:
        # Make async request to Recall API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                RECALL_CALENDAR_AUTH_URL,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            # Handle different response status codes
            if response.status_code == 200:
                data = response.json()
                
                # Extract token (this is the only field returned by Recall API)
                token = data.get("token")
                if not token:
                    raise HTTPException(
                        status_code=500,
                        detail="No token received from Recall API"
                    )
                
                # Calculate expires_at (24 hours from now as per documentation)
                from datetime import datetime, timedelta
                expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat() + "Z"
                
                return CalendarAuthResponse(
                    token=token,
                    expires_at=expires_at,
                    user_id=request.user_id
                )
            
            elif response.status_code == 400:
                try:
                    error_data = response.json()
                    error_detail = error_data.get("detail", error_data.get("message", "Bad request"))
                except:
                    error_detail = response.text
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid request: {error_detail}"
                )
            
            elif response.status_code == 401:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid Recall API key configuration"
                )
            
            elif response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded (300 requests per minute). Please try again later."
                )
            
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Recall API returned status {response.status_code}: {response.text}"
                )
                
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request to Recall API timed out"
        )
    
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Network error communicating with Recall API: {str(e)}"
        )
    
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@app.post("/calendar/connect/google", response_model=GoogleCalendarConnectionResponse)
async def initiate_google_calendar_connection(request: GoogleCalendarConnectionRequest, current_user_id: str = Depends(get_current_user)):
    """
    Initiate Google Calendar OAuth connection for a user.
    
    This endpoint generates the OAuth URL that users need to visit to connect
    their Google Calendar following Recall's exact specifications.
    
    IMPORTANT: You must call /calendar/auth-token first to get a calendar_auth_token,
    then pass that token to this endpoint.
    
    Args:
        request: Contains user_id, calendar_auth_token, and optional success/error redirect URLs
        
    Returns:
        GoogleCalendarConnectionResponse: OAuth URL and instructions
        
    Raises:
        HTTPException: 400 if invalid request, 500 if server error
    """
    
    # Validate Google OAuth is configured
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth not configured. Please contact administrator."
        )
    
    # Validate required fields
    if not request.user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="user_id cannot be empty"
        )

    # Ensure user can only connect their own calendar
    if request.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only connect your own Google Calendar"
        )
    
    if not request.calendar_auth_token.strip():
        raise HTTPException(
            status_code=400,
            detail="calendar_auth_token is required. Call /calendar/auth-token first to get a token."
        )
    
    try:
        # Build the OAuth URL according to Recall's exact specifications
        print(f"🔗 Building Google OAuth URL for user: {request.user_id}")
        
        # SCOPES: Space-separated string with required scopes (EXACT format from Recall docs)
        scopes = "https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.email"
        
        # REDIRECT_URI: Must match what's configured in Google OAuth client
        redirect_uri = GOOGLE_REDIRECT_URI
        
        # CLIENT_ID: From your Google OAuth client
        client_id = GOOGLE_CLIENT_ID
        
        # STATE: JSON stringified object with required fields (EXACT format from Recall docs)
        state_data = {
            "recall_calendar_auth_token": request.calendar_auth_token.strip(),
            "google_oauth_redirect_url": redirect_uri,
        }
        
        # Add optional URLs if provided
        if request.success_url:
            state_data["success_url"] = request.success_url.strip()
        if request.error_url:
            state_data["error_url"] = request.error_url.strip()
        
        # Convert state to JSON string with no spaces (compact format)
        state_json = json.dumps(state_data, separators=(',', ':'))
        
        # Debug: Print the exact state being sent
        print(f"📋 State JSON: {state_json}")
        
        # Try NOT URL encoding the state parameter (Recall might expect raw JSON)
        state_encoded = state_json
        
        # Alternative: If above doesn't work, try basic URL encoding
        # state_encoded = urllib.parse.quote(state_json, safe='')
        
        print(f"📋 State encoded: {state_encoded}")
        
        # Build OAuth URL with EXACT parameter structure from Recall documentation
        oauth_params = {
            "scope": scopes,
            "access_type": "offline", 
            "prompt": "consent",
            "include_granted_scopes": "true",
            "response_type": "code",
            "state": state_encoded,
            "redirect_uri": redirect_uri,
            "client_id": client_id
        }
        
        # Construct the full OAuth URL
        oauth_url = f"{GOOGLE_OAUTH_BASE_URL}?" + urllib.parse.urlencode(oauth_params, quote_via=urllib.parse.quote)
        
        print(f"✅ Google OAuth URL generated successfully")
        print(f"🔍 OAuth URL: {oauth_url[:100]}...")  # Log first 100 chars for debugging
        
        return GoogleCalendarConnectionResponse(
            oauth_url=oauth_url,
            state=state_encoded,
            message="Please visit the OAuth URL to connect your Google Calendar. You will be redirected to Recall's servers after authorization."
        )
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    
    except Exception as e:
        print(f"❌ Error initiating Google Calendar connection: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initiate Google Calendar connection: {str(e)}"
        )


@app.get("/calendar/status/{user_id}", response_model=CalendarConnectionStatus)
async def get_calendar_connection_status(user_id: str, current_user_id: str = Depends(get_current_user)):
    """
    Check if a user's calendar is connected and get connection details.
    
    Args:
        user_id: The user ID to check calendar connection for
        
    Returns:
        CalendarConnectionStatus: Connection status and details
    """
    
    if not user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="user_id cannot be empty"
        )

    # Ensure user can only check their own calendar status
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only check your own calendar connection status"
        )
    
    try:
        # Generate calendar auth token to check connection status
        headers = {
            "Authorization": f"Token {RECALL_API_KEY}",
            "accept": "application/json",
            "content-type": "application/json"
        }
        
        payload = {"user_id": user_id.strip()}
        
        async with httpx.AsyncClient() as client:
            # Get calendar auth token
            response = await client.post(
                RECALL_CALENDAR_AUTH_URL,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code != 200:
                return CalendarConnectionStatus(
                    user_id=user_id,
                    connected=False
                )
            
            token_data = response.json()
            calendar_auth_token = token_data.get("token")
            
            if not calendar_auth_token:
                return CalendarConnectionStatus(
                    user_id=user_id,
                    connected=False
                )
            
            # Check if calendar is connected by trying to call a calendar API
            # (This is a placeholder - you'd call an actual Recall calendar status endpoint)
            # For now, we'll assume if we can generate a token, calendar might be connected
            
            return CalendarConnectionStatus(
                user_id=user_id,
                connected=True,  # This is a simplified check
                provider="google",
                last_sync=datetime.now().isoformat()
            )
            
    except Exception as e:
        return CalendarConnectionStatus(
            user_id=user_id,
            connected=False
        )

# ============================================================================
# CALENDAR EVENTS API ENDPOINTS
# ============================================================================

@app.get("/calendar/events/{user_id}", response_model=CalendarEventsListResponse)
async def get_calendar_events(
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user_id: str = Depends(get_current_user)
):
    """
    Get calendar events for a user within a date range.

    Args:
        user_id: The user ID to get events for
        start_date: Start date in ISO format (optional)
        end_date: End date in ISO format (optional)

    Returns:
        CalendarEventsListResponse: List of calendar events
    """

    if not user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="user_id cannot be empty"
        )

    # Ensure user can only access their own calendar events
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own calendar events"
        )

    try:
        # Get user's event IDs
        user_event_ids = user_events.get(user_id, [])

        # Get local events data
        events = []
        for event_id in user_event_ids:
            if event_id in calendar_events:
                event_data = calendar_events[event_id]

                # Filter by date range if provided
                if start_date or end_date:
                    event_start = datetime.fromisoformat(event_data['start_time'].replace('Z', '+00:00'))

                    if start_date:
                        filter_start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                        if event_start < filter_start:
                            continue

                    if end_date:
                        filter_end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                        if event_start > filter_end:
                            continue

                events.append(CalendarEventResponse(**event_data))

        # Get Google Calendar events if user is connected
        google_events = await fetch_google_calendar_events_from_recall(user_id, start_date, end_date)
        for google_event in google_events:
            events.append(CalendarEventResponse(**google_event))

        # Sort events by start time
        events.sort(key=lambda x: x.start_time)

        return CalendarEventsListResponse(
            events=events,
            total_count=len(events),
            start_date=start_date or "",
            end_date=end_date or ""
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get calendar events: {str(e)}"
        )

@app.post("/calendar/events", response_model=CalendarEventResponse)
async def create_calendar_event(request: CalendarEventRequest, user_id: str, current_user_id: str = Depends(get_current_user)):
    """
    Create a new calendar event.

    Args:
        request: Calendar event data
        user_id: The user ID creating the event (passed as query parameter)

    Returns:
        CalendarEventResponse: Created event data
    """

    if not user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="user_id query parameter is required"
        )

    # Ensure user can only create events for themselves
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only create calendar events for your own account"
        )

    try:
        # Generate unique event ID
        event_id = f"event_{int(datetime.now().timestamp() * 1000)}"

        # Create event data
        now = datetime.now().isoformat() + "Z"
        event_data = {
            "id": event_id,
            "title": request.title,
            "description": request.description,
            "start_time": request.start_time,
            "end_time": request.end_time,
            "attendees": request.attendees or [],
            "meeting_link": request.meeting_link,
            "location": request.location,
            "created_at": now,
            "updated_at": now,
            "user_id": user_id
        }

        # Store event
        calendar_events[event_id] = event_data

        # Add to user's events
        if user_id not in user_events:
            user_events[user_id] = []
        user_events[user_id].append(event_id)

        return CalendarEventResponse(**event_data)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create calendar event: {str(e)}"
        )

@app.put("/calendar/events/{event_id}", response_model=CalendarEventResponse)
async def update_calendar_event(event_id: str, request: CalendarEventRequest, user_id: str, current_user_id: str = Depends(get_current_user)):
    """
    Update an existing calendar event.

    Args:
        event_id: The event ID to update
        request: Updated event data
        user_id: The user ID (passed as query parameter)

    Returns:
        CalendarEventResponse: Updated event data
    """

    if not user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="user_id query parameter is required"
        )

    # Ensure user can only update events for themselves
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update calendar events for your own account"
        )

    if event_id not in calendar_events:
        raise HTTPException(
            status_code=404,
            detail=f"Event {event_id} not found"
        )

    # Check if user owns this event
    event_data = calendar_events[event_id]
    if event_data.get("user_id") != user_id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update this event"
        )

    try:
        # Update event data
        event_data.update({
            "title": request.title,
            "description": request.description,
            "start_time": request.start_time,
            "end_time": request.end_time,
            "attendees": request.attendees or [],
            "meeting_link": request.meeting_link,
            "location": request.location,
            "updated_at": datetime.now().isoformat() + "Z"
        })

        calendar_events[event_id] = event_data

        return CalendarEventResponse(**event_data)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update calendar event: {str(e)}"
        )

@app.delete("/calendar/events/{event_id}")
async def delete_calendar_event(event_id: str, user_id: str, current_user_id: str = Depends(get_current_user)):
    """
    Delete a calendar event.

    Args:
        event_id: The event ID to delete
        user_id: The user ID (passed as query parameter)

    Returns:
        dict: Confirmation message
    """

    if not user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="user_id query parameter is required"
        )

    # Ensure user can only delete events for themselves
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete calendar events for your own account"
        )

    if event_id not in calendar_events:
        raise HTTPException(
            status_code=404,
            detail=f"Event {event_id} not found"
        )

    # Check if user owns this event
    event_data = calendar_events[event_id]
    if event_data.get("user_id") != user_id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to delete this event"
        )

    try:
        # Remove from calendar_events
        del calendar_events[event_id]

        # Remove from user's events list
        if user_id in user_events and event_id in user_events[user_id]:
            user_events[user_id].remove(event_id)

        return {
            "message": f"Event {event_id} deleted successfully",
            "event_id": event_id,
            "timestamp": datetime.now().isoformat() + "Z"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete calendar event: {str(e)}"
        )

# ============================================================================
# RUN THE SERVER
# ============================================================================

if __name__ == "__main__":
    print("🚀 Starting Recall AI Bot Service...")
    print("📖 Documentation will be available at: http://localhost:8000/docs")
    print("🔍 Alternative docs at: http://localhost:8000/redoc")
    print("❤️  Health check at: http://localhost:8000/health")
    
    # This runs the server when you execute the file directly
    uvicorn.run(
        "main:app",  # app location (module:variable)
        host="0.0.0.0",  # Listen on all network interfaces
        port=8000,  # Port number
        reload=True,  # Auto-reload when code changes (for development)
        log_level="info"  # Logging level
    )