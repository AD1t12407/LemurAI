import requests
import time

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
    
    def create_bot(self, meeting_url, bot_name='Meeting Bot'):
        """
        Create a bot and send it to join the meeting.
        
        Args:
            meeting_url (str): The URL of the meeting to join
            bot_name (str): Name for the bot (optional, defaults to 'Meeting Bot')
            
        Returns:
            str: The bot ID that was created
        """
        print(f'🎬 Creating bot for meeting: {meeting_url}')
        
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
        
        print(f'✅ Bot created: {self.bot_id}')
        print('🤖 Bot is joining the meeting...')
        
        return self.bot_id
    
    def get_bot_status(self, bot_id=None):
        """
        Get the current status of a bot.
        
        Args:
            bot_id (str): Bot ID to check (optional, uses current bot if not provided)
            
        Returns:
            str: Current status of the bot
        """
        # Use provided bot_id or fall back to instance bot_id
        bot_id = bot_id or self.bot_id
        
        if not bot_id:
            raise ValueError("No bot_id provided and no current bot available")
        
        response = requests.get(f'{self.base_url}/bot/{bot_id}', headers=self._get_headers())
        response.raise_for_status()
        
        bot_data = response.json()
        status_changes = bot_data.get('status_changes', [])
        
        if status_changes:
            return status_changes[-1].get('code', 'unknown')
        else:
            return 'unknown'
    
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
            raise ValueError("No bot_id provided and no current bot available")
        
        # Return cached data if available and not forcing refresh
        if self.bot_data and not force_refresh:
            return self.bot_data
        
        # Fetch fresh data from API
        response = requests.get(f'{self.base_url}/bot/{bot_id}', headers=self._get_headers())
        response.raise_for_status()
        
        # Cache the data
        self.bot_data = response.json()
        return self.bot_data
    
    def refresh_bot_data(self, bot_id=None):
        """
        Force refresh of bot data from API.
        
        Args:
            bot_id (str): Bot ID to refresh data for (optional, uses current bot if not provided)
            
        Returns:
            dict: Fresh bot data from the API
        """
        return self.get_bot_data(bot_id, force_refresh=True)
        
    def wait_for_completion(self, bot_id=None):  
        """
        Wait for the bot to finish recording.
        
        Args:
            bot_id (str): Bot ID to wait for (optional, uses current bot if not provided)
            
        Returns:
            dict: Final bot data with recordings
        """
        bot_id = bot_id or self.bot_id
        
        if not bot_id:
            raise ValueError("No bot_id provided and no current bot available")
        
        print('⏳ Waiting for meeting to end...')
        
        while True:
            current_status = self.get_bot_status(bot_id)
            print(f'📊 Bot status: {current_status}')
            
            if current_status == 'done':
                print('🎉 Recording complete!')
                break
            elif current_status == 'fatal':
                raise Exception('Bot failed to join meeting')
            
            time.sleep(5)
        
        # Get final bot data with recordings
        response = requests.get(f'{self.base_url}/bot/{bot_id}', headers=self._get_headers())
        response.raise_for_status()
        return response.json()
    
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
    
    def print_results(self, video_url, transcript_url):
        """
        Print the download URLs in a nice format.
        
        Args:
            video_url (str): URL for video download
            transcript_url (str): URL for transcript download
        """
        print('\n🎯 DOWNLOAD LINKS:')
        print('=' * 60)
        
        if video_url:
            print(f'🎥 Video URL:\n{video_url}\n')
        else:
            print('❌ No video available\n')
        
        if transcript_url:
            print(f'📝 Transcript URL:\n{transcript_url}\n')
        else:
            print('❌ No transcript available\n')
        
        print('✨ Copy the URLs above into your browser to download files.')
    
    def record_meeting(self, meeting_url, bot_name='Meeting Bot'):
        """
        Complete workflow: create bot, wait for completion, and return URLs.
        This is a convenience method that does everything in one call.
        
        Args:
            meeting_url (str): The URL of the meeting to record
            bot_name (str): Name for the bot (optional)
            
        Returns:
            tuple: (video_url, transcript_url)
        """
        try:
            # Step 1: Create bot
            bot_id = self.create_bot(meeting_url, bot_name)
            
            # Step 2: Wait for recording to complete
            final_bot_data = self.wait_for_completion(bot_id)
            
            # Step 3: Extract URLs
            video_url, transcript_url = self.extract_download_urls(final_bot_data)
            
            # Step 4: Show results
            self.print_results(video_url, transcript_url)
            
            return video_url, transcript_url
            
        except Exception as e:
            print(f'❌ Error: {e}')
            return None, None