"""
Recall AI bot management API routes
Real implementation using Recall AI service
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
from datetime import datetime
from app.core.auth import get_current_user
from app.core.recall_service import (
    recall_service, get_user_bots, add_user_bot,
    remove_user_bot, cleanup_old_bots
)
from app.utils.config import get_settings

router = APIRouter()
settings = get_settings()


# Pydantic models for request/response
class CreateBotRequest(BaseModel):
    """Model for creating a bot"""
    meeting_url: HttpUrl
    bot_name: Optional[str] = "Lemur AI Meeting Bot"

    class Config:
        json_schema_extra = {
            "example": {
                "meeting_url": "https://meet.google.com/abc-defg-hij",
                "bot_name": "My Recording Bot"
            }
        }


class BotResponse(BaseModel):
    """Model for bot response"""
    bot_id: str
    status: str
    meeting_url: str
    bot_name: str
    created_at: str
    message: str


class BotStatusResponse(BaseModel):
    """Model for bot status response"""
    bot_id: str
    status: str
    meeting_url: str
    bot_name: str
    status_changes: List[dict]
    checked_at: str


class DownloadUrlsResponse(BaseModel):
    """Model for download URLs response"""
    bot_id: str
    video_url: Optional[str]
    audio_url: Optional[str]
    transcript_url: Optional[str]
    chat_messages_url: Optional[str]
    status: str


@router.post("/create-bot", response_model=BotResponse)
async def create_bot(
    request: CreateBotRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Create new Recall AI bot for meeting recording"""
    try:
        # Create bot using real Recall AI service
        result = recall_service.create_bot(
            meeting_url=str(request.meeting_url),
            bot_name=request.bot_name
        )

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create bot: {result.get('error', 'Unknown error')}"
            )

        # Store bot association with user
        bot_id = result["bot_id"]
        add_user_bot(current_user_id, bot_id)

        return BotResponse(
            bot_id=bot_id,
            status=result["status"],
            meeting_url=result["meeting_url"],
            bot_name=result["bot_name"],
            created_at=result["created_at"],
            message="Bot created successfully with Recall AI"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating bot: {str(e)}"
        )


@router.get("/bot/{bot_id}/status", response_model=BotStatusResponse)
async def get_bot_status(
    bot_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Get status of specific bot"""
    try:
        # Verify user owns this bot
        user_bot_ids = get_user_bots(current_user_id)
        if bot_id not in user_bot_ids:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this bot"
            )

        # Get bot status from Recall AI
        result = recall_service.get_bot_status(bot_id)

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get bot status: {result.get('error', 'Unknown error')}"
            )

        return BotStatusResponse(
            bot_id=bot_id,
            status=result["status"],
            meeting_url=result["meeting_url"],
            bot_name=result["bot_name"],
            status_changes=result["status_changes"],
            checked_at=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting bot status: {str(e)}"
        )


@router.get("/bot/{bot_id}/download-urls", response_model=DownloadUrlsResponse)
async def get_download_urls(
    bot_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Get download URLs for bot recordings"""
    try:
        # Verify user owns this bot
        user_bot_ids = get_user_bots(current_user_id)
        if bot_id not in user_bot_ids:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this bot"
            )

        # Get download URLs from Recall AI
        result = recall_service.get_download_urls(bot_id)

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get download URLs: {result.get('error', 'Unknown error')}"
            )

        return DownloadUrlsResponse(
            bot_id=bot_id,
            video_url=result["video_url"],
            audio_url=result["audio_url"],
            transcript_url=result["transcript_url"],
            chat_messages_url=result["chat_messages_url"],
            status=result["status"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting download URLs: {str(e)}"
        )


@router.delete("/bot/{bot_id}")
async def remove_bot(
    bot_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Remove/stop bot"""
    try:
        # Verify user owns this bot
        user_bot_ids = get_user_bots(current_user_id)
        if bot_id not in user_bot_ids:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this bot"
            )

        # Delete bot using Recall AI service
        result = recall_service.delete_bot(bot_id)

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete bot: {result.get('error', 'Unknown error')}"
            )

        # Remove bot from user's bot list
        remove_user_bot(current_user_id, bot_id)

        return {
            "bot_id": bot_id,
            "status": "deleted",
            "message": "Bot deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting bot: {str(e)}"
        )


@router.get("/")
async def list_active_bots(current_user_id: str = Depends(get_current_user)):
    """List all active bots for user"""
    try:
        user_bot_ids = get_user_bots(current_user_id)
        active_bots = []

        for bot_id in user_bot_ids:
            try:
                status_result = recall_service.get_bot_status(bot_id)
                if status_result["success"]:
                    active_bots.append({
                        "bot_id": bot_id,
                        "status": status_result["status"],
                        "meeting_url": status_result["meeting_url"],
                        "bot_name": status_result["bot_name"],
                        "created_at": status_result["created_at"]
                    })
            except Exception as e:
                # Skip bots that can't be retrieved
                continue

        return {
            "user_id": current_user_id,
            "active_bots": active_bots,
            "total_count": len(active_bots)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing bots: {str(e)}"
        )


@router.post("/cleanup")
async def cleanup_old_bots_endpoint(current_user_id: str = Depends(get_current_user)):
    """Cleanup old/inactive bots"""
    try:
        result = cleanup_old_bots(current_user_id)

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to cleanup bots: {result.get('error', 'Unknown error')}"
            )

        return {
            "user_id": current_user_id,
            "cleaned_up": result["cleaned_up"],
            "remaining_bots": result["remaining_bots"],
            "message": f"Cleaned up {result['cleaned_up']} old bots"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cleaning up bots: {str(e)}"
        )
