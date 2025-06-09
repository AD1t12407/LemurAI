import requests
import time
import dotenv
import os
from dotenv import load_dotenv
import os

# Load the .env file
load_dotenv()  # This reads the .env file and loads the env variables

# Now you can access the API key using os.getenv or os.environ
api_key = os.getenv("API_KEY")  # or os.environ["API_KEY"]

# Configuration
API_KEY = str(api_key)
BASE_URL = 'https://us-west-2.recall.ai/api/v1'
MEETING_URL = 'https://meet.google.com/ecs-qpkr-aft'

def get_headers():
    """Return API headers for requests"""
    return {
        'Authorization': f'Token {API_KEY}',
        'Content-Type': 'application/json'
    }

def create_bot(meeting_url):
    """Create a bot and send it to join the meeting. Returns bot_id."""
    print(f'🎬 Creating bot for meeting: {meeting_url}')
    bot_config = {
        'meeting_url': meeting_url,
        'bot_name': 'Meeting Bot',
        'recording_config': {
            'transcript': {
                'provider': {
                    'meeting_captions': {}
                }
            }
        }
    }
    
    response = requests.post(f'{BASE_URL}/bot', json=bot_config, headers=get_headers())
    response.raise_for_status()
    
    bot_data = response.json()
    bot_id = bot_data['id']
    
    print(f'✅ Bot created: {bot_id}')
    print('🤖 Bot is joining the meeting...')
    
    return bot_id

def get_bot_current_status(bot_id):
    """Get the current status of a bot. Returns status string."""
    response = requests.get(f'{BASE_URL}/bot/{bot_id}', headers=get_headers())
    response.raise_for_status()
    
    bot_data = response.json()
    status_changes = bot_data.get('status_changes', [])
    
    if status_changes:
        return status_changes[-1].get('code', 'unknown')
    else:
        return 'unknown'

def wait_for_completion(bot_id):
    """Wait for the bot to finish recording. Returns final bot data."""
    print('⏳ Waiting for meeting to end...')
    
    while True:
        current_status = get_bot_current_status(bot_id)
        print(f'📊 Bot status: {current_status}')
        
        if current_status == 'done':
            print('🎉 Recording complete!')
            break
        elif current_status == 'fatal':
            raise Exception('Bot failed to join meeting')
        
        time.sleep(5)
    
    # Get final bot data with recordings
    response = requests.get(f'{BASE_URL}/bot/{bot_id}', headers=get_headers())
    response.raise_for_status()
    return response.json()

def extract_download_urls(bot_data):
    """Extract video and transcript URLs from bot data. Returns (video_url, transcript_url)."""
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

def print_results(video_url, transcript_url):
    """Print the download URLs in a nice format."""
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

if __name__ == '__main__':
    try:
        # Step 1: Create bot
        bot_id = create_bot(MEETING_URL)
        
        # Step 2: Wait for recording to complete
        final_bot_data = wait_for_completion(bot_id)
        
        # Step 3: Extract URLs
        video_url, transcript_url = extract_download_urls(final_bot_data)
        
        # Step 4: Show results
        print_results(video_url, transcript_url)
        
    except Exception as e:
        print(f'❌ Error: {e}')