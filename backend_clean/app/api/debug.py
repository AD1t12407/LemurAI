"""
Debug API routes
"""

from fastapi import APIRouter, HTTPException
from app.core.database import db_manager, get_supabase_client
from app.core.auth import DEMO_USERS

router = APIRouter()


@router.get("/users")
async def debug_users():
    """Debug: Get all users in database"""
    try:
        supabase = get_supabase_client()
        result = supabase.table("users").select("*").execute()
        
        return {
            "total_users": len(result.data),
            "users": result.data,
            "demo_users": list(DEMO_USERS.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@router.get("/test")
async def debug_test():
    """Debug: Test database connection and basic functionality"""
    try:
        supabase = get_supabase_client()
        
        # Test each table
        tables_status = {}
        tables = ["users", "clients", "sub_clients", "files", "outputs"]
        
        for table in tables:
            try:
                result = supabase.table(table).select("id").limit(1).execute()
                tables_status[table] = {
                    "accessible": True,
                    "count": len(result.data)
                }
            except Exception as e:
                tables_status[table] = {
                    "accessible": False,
                    "error": str(e)
                }
        
        return {
            "database_connection": "OK",
            "tables": tables_status,
            "demo_users_available": len(DEMO_USERS)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug test failed: {str(e)}")


@router.get("/google-tokens")
async def debug_google_tokens():
    """Debug: Check Google OAuth tokens status"""
    # This would check stored Google tokens in the database
    # For now, return placeholder
    return {
        "message": "Google tokens debug endpoint",
        "status": "not_implemented",
        "note": "This would show stored Google OAuth tokens for debugging"
    }


@router.post("/connect-user/{user_id}")
async def manually_connect_user(user_id: str):
    """Debug: Manually connect user (for testing)"""
    try:
        user = await db_manager.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "message": f"User {user_id} manually connected",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"]
            },
            "status": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error connecting user: {str(e)}")


@router.get("/calendar-test/{user_id}")
async def test_calendar_integration(user_id: str):
    """Debug: Test calendar integration with Recall AI"""
    try:
        import httpx
        from app.utils.config import get_settings

        settings = get_settings()

        # Test 1: Generate calendar auth token
        headers = {
            "Authorization": f"Token {settings.recall_api_key}",
            "accept": "application/json",
            "content-type": "application/json"
        }

        payload = {"user_id": user_id}

        async with httpx.AsyncClient() as client:
            # Test auth token generation
            auth_response = await client.post(
                settings.recall_calendar_auth_url,
                headers=headers,
                json=payload,
                timeout=30.0
            )

            auth_result = {
                "status_code": auth_response.status_code,
                "success": auth_response.status_code == 200
            }

            if auth_response.status_code == 200:
                auth_data = auth_response.json()
                auth_result["token_received"] = "token" in auth_data
                calendar_auth_token = auth_data.get("token")

                # Test 2: Fetch meetings
                if calendar_auth_token:
                    meetings_headers = {
                        "Authorization": f"Token {settings.recall_api_key}",
                        "x-recallcalendarauthtoken": calendar_auth_token,
                        "Content-Type": "application/json"
                    }

                    meetings_response = await client.get(
                        "https://us-west-2.recall.ai/api/v1/calendar/meetings/",
                        headers=meetings_headers,
                        timeout=30.0
                    )

                    meetings_result = {
                        "status_code": meetings_response.status_code,
                        "success": meetings_response.status_code == 200
                    }

                    if meetings_response.status_code == 200:
                        meetings_data = meetings_response.json()
                        meetings_result["meetings_count"] = len(meetings_data)
                        meetings_result["sample_meeting"] = meetings_data[0] if meetings_data else None
                    else:
                        meetings_result["error"] = meetings_response.text
                else:
                    meetings_result = {"error": "No auth token received"}
            else:
                auth_result["error"] = auth_response.text
                meetings_result = {"error": "Auth failed, cannot test meetings"}

        return {
            "user_id": user_id,
            "recall_api_key_configured": bool(settings.recall_api_key),
            "auth_test": auth_result,
            "meetings_test": meetings_result,
            "timestamp": "2025-06-09T22:30:00Z"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calendar test failed: {str(e)}")
