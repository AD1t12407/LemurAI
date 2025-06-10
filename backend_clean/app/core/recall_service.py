"""
Recall AI service integration
Real implementation using the proven RecallAIBot class
"""

import logging
from typing import Dict, Any, List
try:
    import requests
except ImportError:
    print("⚠️  requests library not found. Install with: pip install requests")
    requests = None

from app.utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class RecallAIBot:
    """
    A class to handle Recall AI meeting recording operations.

    This class encapsulates all the functionality needed to:
    - Create a bot that joins meetings
    - Monitor the recording status
    - Extract download URLs for video and transcript
    """

    def __init__(self, api_key, base_url='https://us-west-2.recall.ai/api/v1'):
        """
        Initialize the RecallAI bot with API credentials.

        Args:
            api_key (str): Your Recall AI API key
            base_url (str): The base URL for Recall AI API (optional)
        """
        self.api_key = api_key
        self.base_url = base_url
        self.bot_id = None  # Will store the current bot ID
        self.bot_data = None  # Will store the full bot data from API

    def _get_headers(self):
        """
        Private method to return API headers for requests.
        The underscore indicates this is for internal use only.

        Returns:
            dict: Headers dictionary with authorization and content type
        """
        return {
            'Authorization': f'Token {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def create_bot(self, meeting_url, bot_name='Lemur AI Bot'):
        """
        Create a bot and send it to join the meeting.

        Args:
            meeting_url (str): The URL of the meeting to join
            bot_name (str): Name for the bot (optional, defaults to 'Lemur AI Bot')

        Returns:
            dict: Success status and bot information
        """
        try:
            logger.info(f'🎬 Creating bot for meeting: {meeting_url}')

            bot_config = {
                'meeting_url': meeting_url,
                'bot_name': bot_name,
                'recording_config': {
                    'transcript': {
                        'provider': {
                            'meeting_captions': {}
                        }
                    }
                }
            }

            response = requests.post(f'{self.base_url}/bot', json=bot_config, headers=self._get_headers())
            response.raise_for_status()

            bot_data = response.json()
            self.bot_id = bot_data['id']  # Store bot_id in the instance

            logger.info(f'✅ Bot created: {self.bot_id}')
            logger.info('🤖 Bot is joining the meeting...')

            # Parse the meeting_url object for response
            meeting_url_obj = bot_data.get("meeting_url", {})
            if isinstance(meeting_url_obj, dict):
                meeting_url_str = f"https://{meeting_url_obj.get('platform', 'unknown')}.com/{meeting_url_obj.get('meeting_id', '')}"
            else:
                meeting_url_str = str(meeting_url_obj)

            return {
                "success": True,
                "bot_id": bot_data.get("id"),
                "status": "created",
                "meeting_url": meeting_url_str,
                "bot_name": bot_data.get("bot_name"),
                "created_at": bot_data.get("join_at"),
                "data": bot_data
            }

        except Exception as e:
            logger.error(f'❌ Error creating bot: {e}')
            return {
                "success": False,
                "error": "Bot creation error",
                "detail": str(e)
            }
    
    def get_bot_status(self, bot_id=None):
        """
        Get the current status of a bot.

        Args:
            bot_id (str): Bot ID to check (optional, uses current bot if not provided)

        Returns:
            dict: Bot status information
        """
        try:
            # Use provided bot_id or fall back to instance bot_id
            bot_id = bot_id or self.bot_id

            if not bot_id:
                return {
                    "success": False,
                    "error": "No bot_id provided and no current bot available"
                }

            response = requests.get(f'{self.base_url}/bot/{bot_id}', headers=self._get_headers())
            response.raise_for_status()

            bot_data = response.json()
            status_changes = bot_data.get('status_changes', [])

            if status_changes:
                current_status = status_changes[-1].get('code', 'unknown')
            else:
                # When status_changes is empty, bot is in initial state
                # Check if bot has recordings to determine if it's done
                recordings = bot_data.get('recordings', [])
                if recordings:
                    current_status = 'done'
                else:
                    current_status = 'waiting_to_join'

            # Parse the meeting_url object
            meeting_url_obj = bot_data.get("meeting_url", {})
            if isinstance(meeting_url_obj, dict):
                meeting_url_str = f"https://{meeting_url_obj.get('platform', 'unknown')}.com/{meeting_url_obj.get('meeting_id', '')}"
            else:
                meeting_url_str = str(meeting_url_obj)

            return {
                "success": True,
                "bot_id": bot_id,
                "status": current_status,
                "meeting_url": meeting_url_str,
                "bot_name": bot_data.get("bot_name"),
                "created_at": bot_data.get("join_at"),
                "status_changes": status_changes,
                "data": bot_data
            }

        except Exception as e:
            logger.error(f"❌ Error getting bot status: {e}")
            return {
                "success": False,
                "error": "Bot status error",
                "detail": str(e)
            }
    
    def get_bot_data(self, bot_id=None, force_refresh=False):
        """
        Get full bot data including recordings. Caches the data for efficiency.

        Args:
            bot_id (str): Bot ID to get data for (optional, uses current bot if not provided)
            force_refresh (bool): If True, fetches fresh data from API even if cached

        Returns:
            dict: Complete bot data from the API
        """
        bot_id = bot_id or self.bot_id

        if not bot_id:
            return {
                "success": False,
                "error": "No bot_id provided and no current bot available"
            }

        # Return cached data if available and not forcing refresh
        if self.bot_data and not force_refresh:
            return {"success": True, "data": self.bot_data}

        try:
            # Fetch fresh data from API
            response = requests.get(f'{self.base_url}/bot/{bot_id}', headers=self._get_headers())
            response.raise_for_status()

            # Cache the data
            self.bot_data = response.json()
            return {"success": True, "data": self.bot_data}

        except Exception as e:
            logger.error(f"❌ Error getting bot data: {e}")
            return {
                "success": False,
                "error": "Bot data error",
                "detail": str(e)
            }

    def extract_download_urls(self, bot_data):
        """
        Extract video and transcript URLs from bot data.

        Args:
            bot_data (dict): Bot data containing recordings

        Returns:
            tuple: (video_url, transcript_url) - either can be None if not available
        """
        recordings = bot_data.get('recordings', [])

        if not recordings:
            return None, None

        recording = recordings[0]
        media_shortcuts = recording.get('media_shortcuts', {})

        # Extract video URL
        video_url = None
        if 'video_mixed' in media_shortcuts:
            video_data = media_shortcuts['video_mixed'].get('data', {})
            video_url = video_data.get('download_url')

        # Extract transcript URL
        transcript_url = None
        if 'transcript' in media_shortcuts:
            transcript_data = media_shortcuts['transcript'].get('data', {})
            transcript_url = transcript_data.get('download_url')

        return video_url, transcript_url

    def get_download_urls(self, bot_id=None) -> Dict[str, Any]:
        """Get download URLs for bot recordings"""
        try:
            bot_id = bot_id or self.bot_id

            if not bot_id:
                return {
                    "success": False,
                    "error": "No bot_id provided and no current bot available"
                }

            # Get fresh bot data
            bot_data_result = self.get_bot_data(bot_id, force_refresh=True)
            if not bot_data_result["success"]:
                return bot_data_result

            bot_data = bot_data_result["data"]

            # Extract download URLs using the working method
            video_url, transcript_url = self.extract_download_urls(bot_data)

            # Get current status
            status_changes = bot_data.get("status_changes", [])
            current_status = status_changes[-1].get("code", "unknown") if status_changes else "unknown"

            return {
                "success": True,
                "bot_id": bot_id,
                "video_url": video_url,
                "audio_url": video_url,  # Same as video for now
                "transcript_url": transcript_url,
                "chat_messages_url": None,  # Not implemented in extract method
                "status": current_status,
                "data": bot_data
            }

        except Exception as e:
            logger.error(f"❌ Error getting download URLs: {e}")
            return {
                "success": False,
                "error": "Download URLs error",
                "detail": str(e)
            }
    
    def delete_bot(self, bot_id=None) -> Dict[str, Any]:
        """Delete/stop a Recall AI bot (only works for scheduled bots that haven't joined)"""
        try:
            bot_id = bot_id or self.bot_id

            if not bot_id:
                return {
                    "success": False,
                    "error": "No bot_id provided and no current bot available"
                }

            response = requests.delete(f'{self.base_url}/bot/{bot_id}', headers=self._get_headers())

            if response.status_code == 204:
                logger.info(f"✅ Recall AI bot deleted successfully: {bot_id}")
                return {
                    "success": True,
                    "bot_id": bot_id,
                    "status": "deleted",
                    "message": "Bot deleted successfully"
                }
            elif response.status_code == 405:
                # This is expected for bots that have already joined
                try:
                    error_data = response.json()
                    if "cannot_delete_bot" in error_data.get("code", ""):
                        logger.info(f"ℹ️  Bot {bot_id} cannot be deleted (already joined meeting)")
                        return {
                            "success": True,  # Consider this success since bot is active
                            "bot_id": bot_id,
                            "status": "active_cannot_delete",
                            "message": "Bot is active and cannot be deleted (this is normal for joined bots)"
                        }
                except:
                    pass

                return {
                    "success": False,
                    "error": f"Cannot delete bot: {response.status_code}",
                    "detail": response.text
                }
            else:
                logger.error(f"❌ Failed to delete bot: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"Failed to delete bot: {response.status_code}",
                    "detail": response.text
                }

        except Exception as e:
            logger.error(f"❌ Error deleting bot: {e}")
            return {
                "success": False,
                "error": "Bot deletion error",
                "detail": str(e)
            }
    
    def list_bots(self) -> Dict[str, Any]:
        """List all bots for the API key"""
        try:
            response = requests.get(f'{self.base_url}/bot', headers=self._get_headers())
            response.raise_for_status()

            bots_data = response.json()
            return {
                "success": True,
                "bots": bots_data.get("results", []),
                "total_count": bots_data.get("count", 0),
                "data": bots_data
            }

        except Exception as e:
            logger.error(f"❌ Error listing bots: {e}")
            return {
                "success": False,
                "error": "Bot listing error",
                "detail": str(e)
            }


# Global Recall AI service instance
recall_service = RecallAIBot(settings.recall_api_key)


# In-memory storage for user-bot mapping (in production, use database)
user_bots: Dict[str, List[str]] = {}  # user_id -> list of bot_ids


def get_user_bots(user_id: str) -> List[str]:
    """Get bot IDs for a specific user"""
    return user_bots.get(user_id, [])


def add_user_bot(user_id: str, bot_id: str):
    """Add a bot ID to a user's bot list"""
    if user_id not in user_bots:
        user_bots[user_id] = []
    user_bots[user_id].append(bot_id)


def remove_user_bot(user_id: str, bot_id: str):
    """Remove a bot ID from a user's bot list"""
    if user_id in user_bots and bot_id in user_bots[user_id]:
        user_bots[user_id].remove(bot_id)


def cleanup_old_bots(user_id: str) -> Dict[str, Any]:
    """Cleanup old/inactive bots for a user"""
    try:
        user_bot_ids = get_user_bots(user_id)
        cleaned_up = 0

        for bot_id in user_bot_ids.copy():
            status_result = recall_service.get_bot_status(bot_id)
            if status_result["success"]:
                status = status_result["status"]
                # Clean up bots that are done, failed, or error
                # Note: Most active bots cannot be deleted from Recall AI, so we just remove from our tracking
                if status in ["done", "failed", "error", "fatal"]:
                    # Try to delete from Recall AI (may fail, that's OK)
                    delete_result = recall_service.delete_bot(bot_id)
                    # Remove from our tracking regardless
                    remove_user_bot(user_id, bot_id)
                    cleaned_up += 1
                    logger.info(f"🧹 Cleaned up bot {bot_id} with status {status}")

        return {
            "success": True,
            "cleaned_up": cleaned_up,
            "remaining_bots": len(get_user_bots(user_id))
        }

    except Exception as e:
        logger.error(f"❌ Error cleaning up bots: {e}")
        return {
            "success": False,
            "error": "Cleanup error",
            "detail": str(e)
        }
