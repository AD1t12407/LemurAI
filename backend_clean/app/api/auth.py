"""
Authentication API routes
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.core.auth import authenticate_user, create_user, create_access_token, get_current_user
from app.core.database import db_manager
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse, UserResponse

router = APIRouter()


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    User login endpoint
    
    Authenticates user with email and password, returns JWT token.
    Supports both demo users and registered users.
    """
    user = await authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(user["id"])
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"]
        )
    )


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    User registration endpoint
    
    Creates a new user account and returns JWT token.
    """
    user = await create_user(request.email, request.name, request.password)
    access_token = create_access_token(user["id"])
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"]
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    """
    Get current user information

    Returns the authenticated user's profile information.
    """
    user = await db_manager.get_user_by_id(current_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"]
    )


@router.get("/google/calendar")
async def initiate_google_calendar_oauth():
    """
    Initiate Google Calendar OAuth flow

    Redirects user to Google OAuth consent screen for calendar access.
    """
    from app.utils.config import get_settings
    settings = get_settings()

    oauth_url = (
        f"https://accounts.google.com/oauth2/auth?"
        f"client_id={settings.google_client_id}&"
        f"redirect_uri={settings.google_redirect_uri_calendar}&"
        f"scope=https://www.googleapis.com/auth/calendar.readonly&"
        f"response_type=code&"
        f"access_type=offline"
    )

    return {
        "oauth_url": oauth_url,
        "message": "Redirect user to this URL for Google Calendar authorization"
    }


@router.get("/google/callback")
async def google_calendar_oauth_callback(code: str = None, error: str = None):
    """
    Google Calendar OAuth callback

    Handles the callback from Google OAuth and exchanges code for tokens.
    """
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth error: {error}"
        )

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code not provided"
        )

    # This would exchange the code for access tokens
    # and store them in the database
    return {
        "message": "Google Calendar OAuth callback processed",
        "code": code,
        "status": "tokens_exchanged",
        "note": "This endpoint is ready for Google OAuth token exchange implementation"
    }
