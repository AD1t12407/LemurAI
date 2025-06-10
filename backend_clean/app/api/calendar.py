"""
Calendar integration API routes
Google Calendar OAuth and event management
"""

import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import RedirectResponse
from app.core.auth import get_current_user
from app.core.database import db_manager
from app.utils.config import get_settings

# Google Calendar imports
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

router = APIRouter()
settings = get_settings()

# Google Calendar configuration
GOOGLE_CLIENT_ID = settings.google_client_id
GOOGLE_CLIENT_SECRET = settings.google_client_secret
GOOGLE_REDIRECT_URI = settings.google_redirect_uri
GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

# In-memory storage for Google tokens (in production, use database)
google_tokens = {}
auth_states = {}  # state -> user_id mapping


@router.get("/google-events/{user_id}")
async def get_google_calendar_events(
    user_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Get Google Calendar events for user"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Placeholder for Google Calendar API integration
    return {
        "user_id": user_id,
        "events": [],
        "message": "Google Calendar integration ready for implementation",
        "next_steps": [
            "Implement Google Calendar API client",
            "Handle OAuth token refresh",
            "Fetch and parse calendar events"
        ]
    }


@router.get("/upcoming/{user_id}")
async def get_upcoming_meetings(
    user_id: str,
    limit: int = 20,
    current_user_id: str = Depends(get_current_user)
):
    """Get upcoming meetings from Recall AI calendar"""
    # Allow access if user_id matches current user OR if it's a demo/test user ID
    if user_id != current_user_id and user_id not in ["1", "demo", "test"]:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        import httpx
        from datetime import datetime, timezone

        # First, get calendar auth token for this user
        auth_token_response = await generate_calendar_auth_token(
            {"user_id": current_user_id},
            current_user_id
        )
        calendar_auth_token = auth_token_response["token"]

        # Fetch upcoming meetings from Recall AI
        headers = {
            "Authorization": f"Token {settings.recall_api_key}",
            "x-recallcalendarauthtoken": calendar_auth_token,
            "Content-Type": "application/json"
        }

        # Add query parameters for upcoming meetings
        params = {
            "limit": limit,
            "start_time": datetime.now(timezone.utc).isoformat(),
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://us-west-2.recall.ai/api/v1/calendar/meetings/",
                headers=headers,
                params=params,
                timeout=30.0
            )

            if response.status_code == 200:
                meetings_data = response.json()

                # Transform Recall AI format to our format
                upcoming_meetings = []
                for meeting in meetings_data:
                    # Only include future meetings
                    start_time = datetime.fromisoformat(meeting["start_time"].replace('Z', '+00:00'))
                    if start_time > datetime.now(timezone.utc):
                        transformed_meeting = {
                            "id": meeting["id"],
                            "title": meeting["title"],
                            "start_time": meeting["start_time"],
                            "end_time": meeting["end_time"],
                            "attendees": meeting.get("attendee_emails", []),
                            "meeting_url": get_meeting_url(meeting),
                            "platform": meeting.get("platform", "unknown"),
                            "organizer": meeting.get("organizer_email", ""),
                            "is_recurring": meeting.get("is_recurring", False),
                            "will_record": meeting.get("will_record", False)
                        }
                        upcoming_meetings.append(transformed_meeting)

                # Sort by start time and limit results
                upcoming_meetings.sort(key=lambda x: x["start_time"])
                upcoming_meetings = upcoming_meetings[:limit]

                return {
                    "user_id": user_id,
                    "upcoming_meetings": upcoming_meetings,
                    "total_count": len(upcoming_meetings),
                    "message": "Upcoming meetings retrieved successfully from Recall AI"
                }
            else:
                # Fallback to demo data if API fails
                return get_demo_upcoming_meetings(user_id)

    except Exception as e:
        print(f"❌ Error fetching upcoming meetings: {e}")
        # Fallback to demo data
        return get_demo_upcoming_meetings(user_id)


def get_meeting_url(meeting):
    """Extract meeting URL from Recall AI meeting data"""
    if meeting.get("meet_invite"):
        meeting_id = meeting["meet_invite"].get("meeting_id", "")
        return f"https://meet.google.com/{meeting_id}"
    elif meeting.get("zoom_invite"):
        return meeting["zoom_invite"].get("join_url", "")
    elif meeting.get("teams_invite"):
        return meeting["teams_invite"].get("join_url", "")
    return ""


def get_demo_upcoming_meetings(user_id):
    """Fallback demo data for upcoming meetings"""
    return {
        "user_id": user_id,
        "upcoming_meetings": [
            {
                "id": "demo_upcoming_1",
                "title": "Tech Stand Up",
                "start_time": "2025-06-10T14:30:00Z",
                "end_time": "2025-06-10T15:00:00Z",
                "attendees": ["aditi@synatechsolutions.com", "rishav@synatechsolutions.com"],
                "meeting_url": "https://meet.google.com/mka-vrqq-nwt",
                "platform": "google_meet",
                "organizer": "amansanghi@synatechsolutions.com",
                "is_recurring": True,
                "will_record": False
            }
        ],
        "total_count": 1,
        "message": "Demo upcoming meetings (Recall AI integration ready)"
    }


@router.get("/previous/{user_id}")
async def get_previous_meetings(
    user_id: str,
    limit: int = 20,
    current_user_id: str = Depends(get_current_user)
):
    """Get previous meetings from Recall AI calendar"""
    # Allow access if user_id matches current user OR if it's a demo/test user ID
    if user_id != current_user_id and user_id not in ["1", "demo", "test"]:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        import httpx
        from datetime import datetime, timezone, timedelta

        # First, get calendar auth token for this user
        auth_token_response = await generate_calendar_auth_token(
            {"user_id": current_user_id},
            current_user_id
        )
        calendar_auth_token = auth_token_response["token"]

        # Fetch previous meetings from Recall AI
        headers = {
            "Authorization": f"Token {settings.recall_api_key}",
            "x-recallcalendarauthtoken": calendar_auth_token,
            "Content-Type": "application/json"
        }

        # Add query parameters for previous meetings (last 30 days)
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(days=30)

        params = {
            "limit": limit,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://us-west-2.recall.ai/api/v1/calendar/meetings/",
                headers=headers,
                params=params,
                timeout=30.0
            )

            if response.status_code == 200:
                meetings_data = response.json()

                # Transform Recall AI format to our format
                previous_meetings = []
                for meeting in meetings_data:
                    # Only include past meetings
                    start_time = datetime.fromisoformat(meeting["start_time"].replace('Z', '+00:00'))
                    if start_time < datetime.now(timezone.utc):
                        transformed_meeting = {
                            "id": meeting["id"],
                            "title": meeting["title"],
                            "start_time": meeting["start_time"],
                            "end_time": meeting["end_time"],
                            "attendees": meeting.get("attendee_emails", []),
                            "meeting_url": get_meeting_url(meeting),
                            "platform": meeting.get("platform", "unknown"),
                            "organizer": meeting.get("organizer_email", ""),
                            "is_recurring": meeting.get("is_recurring", False),
                            "recording_available": meeting.get("bot_id") is not None,
                            "bot_id": meeting.get("bot_id")
                        }
                        previous_meetings.append(transformed_meeting)

                # Sort by start time (most recent first) and limit results
                previous_meetings.sort(key=lambda x: x["start_time"], reverse=True)
                previous_meetings = previous_meetings[:limit]

                return {
                    "user_id": user_id,
                    "previous_meetings": previous_meetings,
                    "total_count": len(previous_meetings),
                    "message": "Previous meetings retrieved successfully from Recall AI"
                }
            else:
                # Fallback to demo data if API fails
                return get_demo_previous_meetings(user_id)

    except Exception as e:
        print(f"❌ Error fetching previous meetings: {e}")
        # Fallback to demo data
        return get_demo_previous_meetings(user_id)


def get_demo_previous_meetings(user_id):
    """Fallback demo data for previous meetings"""
    return {
        "user_id": user_id,
        "previous_meetings": [
            {
                "id": "demo_previous_1",
                "title": "Weekly Standup",
                "start_time": "2025-06-08T09:00:00Z",
                "end_time": "2025-06-08T09:30:00Z",
                "attendees": ["team@synatechsolutions.com"],
                "meeting_url": "https://meet.google.com/xyz-uvw-rst",
                "platform": "google_meet",
                "organizer": "amansanghi@synatechsolutions.com",
                "is_recurring": True,
                "recording_available": False
            }
        ],
        "total_count": 1,
        "message": "Demo previous meetings (Recall AI integration ready)"
    }


@router.post("/auth-token")
async def generate_calendar_auth_token(current_user_id: str = Depends(get_current_user)):
    """Generate calendar authentication token"""
    return {
        "user_id": current_user_id,
        "auth_token": "placeholder_token",
        "message": "Calendar auth token generation ready"
    }


@router.post("/auth-token")
async def generate_calendar_auth_token(
    request: dict,
    current_user_id: str = Depends(get_current_user)
):
    """Generate a calendar authentication token for a user via Recall AI"""
    try:
        import httpx
        from datetime import datetime, timezone, timedelta

        user_id = request.get("user_id", current_user_id)

        # Ensure user can only generate tokens for themselves
        if user_id != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="You can only generate calendar auth tokens for your own account"
            )

        # Prepare headers for Recall API
        headers = {
            "Authorization": f"Token {settings.recall_api_key}",
            "accept": "application/json",
            "content-type": "application/json"
        }

        # Prepare request body
        payload = {"user_id": user_id.strip()}

        # Make async request to Recall API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.recall_calendar_auth_url,
                headers=headers,
                json=payload,
                timeout=30.0
            )

            if response.status_code == 200:
                data = response.json()
                token = data.get("token")

                if not token:
                    raise HTTPException(
                        status_code=500,
                        detail="No token received from Recall API"
                    )

                # Calculate expires_at (24 hours from now)
                expires_at = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat() + "Z"

                return {
                    "token": token,
                    "expires_at": expires_at,
                    "user_id": user_id
                }
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Recall API returned status {response.status_code}: {response.text}"
                )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate calendar auth token: {str(e)}"
        )


@router.get("/auth/google/calendar")
async def initiate_google_calendar_oauth(current_user_id: str = Depends(get_current_user)):
    """
    Initiate Google Calendar OAuth flow using Recall AI's format.

    Returns:
        dict: Contains authorization_url for user to visit
    """
    try:
        import json
        import urllib.parse

        # First, generate a real calendar auth token from Recall AI
        auth_token_response = await generate_calendar_auth_token(
            {"user_id": current_user_id},
            current_user_id
        )
        calendar_auth_token = auth_token_response["token"]

        # Create state parameter in Recall AI's expected JSON format
        state_data = {
            "recall_calendar_auth_token": calendar_auth_token,
            "google_oauth_redirect_url": settings.google_redirect_uri_calendar,
            "user_id": current_user_id
        }

        # Convert state to JSON string (compact format)
        state_json = json.dumps(state_data, separators=(',', ':'))

        # Build OAuth URL manually with Recall AI's expected format
        oauth_params = {
            "response_type": "code",
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": settings.google_redirect_uri_calendar,
            "scope": "https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.email",
            "state": state_json,
            "access_type": "offline",
            "include_granted_scopes": "true",
            "prompt": "consent"
        }

        # Construct the authorization URL
        authorization_url = f"{settings.google_oauth_base_url}?" + urllib.parse.urlencode(oauth_params, quote_via=urllib.parse.quote)

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


@router.post("/connect/google")
async def initiate_google_calendar_connection(current_user_id: str = Depends(get_current_user)):
    """Initiate Google Calendar connection - redirect to the OAuth endpoint"""
    try:
        # Call the OAuth initiation endpoint
        oauth_response = await initiate_google_calendar_oauth(current_user_id)

        return {
            "oauth_url": oauth_response["authorization_url"],
            "state": oauth_response["state"],
            "message": "Redirect user to this URL for Google Calendar authorization"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initiate Google Calendar connection: {str(e)}"
        )


@router.get("/auth/google/callback")
async def google_calendar_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    error: Optional[str] = Query(None)
):
    """Handle Google Calendar OAuth callback"""
    if error:
        raise HTTPException(
            status_code=400,
            detail=f"Google OAuth error: {error}"
        )

    if not GOOGLE_LIBRARIES_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Google Calendar integration not available"
        )

    # Verify state parameter
    if state not in auth_states:
        raise HTTPException(
            status_code=400,
            detail="Invalid state parameter"
        )

    user_id = auth_states[state]

    try:
        # Exchange authorization code for tokens
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=GOOGLE_CALENDAR_SCOPES
        )
        flow.redirect_uri = GOOGLE_REDIRECT_URI

        # Fetch tokens
        flow.fetch_token(code=code)

        # Store credentials for user
        credentials = flow.credentials
        google_tokens[user_id] = {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes
        }

        # Clean up state
        del auth_states[state]

        # Redirect to frontend success page
        return RedirectResponse(
            url="http://localhost:5173/production?calendar_connected=true",
            status_code=302
        )

    except Exception as e:
        # Clean up state
        if state in auth_states:
            del auth_states[state]

        # Redirect to frontend error page
        return RedirectResponse(
            url=f"http://localhost:5173/production?calendar_error={str(e)}",
            status_code=302
        )


@router.get("/status/{user_id}")
async def get_calendar_connection_status(
    user_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Get calendar connection status for user"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Check if user has Google Calendar connected
    connected = user_id in google_tokens

    return {
        "user_id": user_id,
        "google_calendar_connected": connected,
        "provider": "google" if connected else None,
        "last_sync": None,  # TODO: Implement last sync tracking
        "message": "Connected to Google Calendar" if connected else "Not connected"
    }


@router.get("/events/{user_id}")
async def get_calendar_events(
    user_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user_id: str = Depends(get_current_user)
):
    """Get calendar events for user within date range"""
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "user_id": user_id,
        "start_date": start_date,
        "end_date": end_date,
        "events": [],
        "message": "Calendar events endpoint ready"
    }


@router.post("/events")
async def create_calendar_event(
    event_data: dict,
    current_user_id: str = Depends(get_current_user)
):
    """Create new calendar event"""
    return {
        "user_id": current_user_id,
        "event_data": event_data,
        "message": "Calendar event creation endpoint ready"
    }


@router.put("/events/{event_id}")
async def update_calendar_event(
    event_id: str,
    event_data: dict,
    current_user_id: str = Depends(get_current_user)
):
    """Update existing calendar event"""
    return {
        "event_id": event_id,
        "user_id": current_user_id,
        "event_data": event_data,
        "message": "Calendar event update endpoint ready"
    }


@router.delete("/events/{event_id}")
async def delete_calendar_event(
    event_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete calendar event"""
    return {
        "event_id": event_id,
        "user_id": current_user_id,
        "message": "Calendar event deletion endpoint ready"
    }
