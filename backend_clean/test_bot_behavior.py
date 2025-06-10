#!/usr/bin/env python3
"""
Test and explain bot behavior
"""

import requests

BASE_URL = "http://localhost:8000"

def test_bot_behavior():
    """Test bot behavior and explain what's happening"""
    print("🤖 Understanding Recall AI Bot Behavior")
    print("=" * 60)
    
    # Authenticate
    login_data = {"email": "demo@lemurai.com", "password": "demo1234"}
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print("❌ Authentication failed")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create bot
    print("🎬 Creating bot for meeting...")
    bot_data = {
        "meeting_url": "https://meet.google.com/dnm-pkfq-dyi",
        "bot_name": "Behavior Test Bot"
    }
    
    response = requests.post(f"{BASE_URL}/create-bot", json=bot_data, headers=headers)
    
    if response.status_code == 200:
        bot_response = response.json()
        bot_id = bot_response["bot_id"]
        
        print(f"✅ Bot created: {bot_id}")
        print(f"   Meeting: https://meet.google.com/dnm-pkfq-dyi")
        
        # Check status
        status_response = requests.get(f"{BASE_URL}/bot/{bot_id}/status", headers=headers)
        if status_response.status_code == 200:
            status_data = status_response.json()
            print(f"   Current status: {status_data['status']}")
            
            print("\n🔍 What's Happening:")
            print("=" * 40)
            
            if status_data['status'] in ['waiting_to_join', 'unknown']:
                print("⏳ Bot is waiting to join the meeting")
                print()
                print("📋 This is NORMAL behavior because:")
                print("   • Recall AI bots wait for human participants")
                print("   • Empty meetings don't trigger bot joining")
                print("   • This prevents unnecessary recordings")
                print()
                print("🎯 To see the bot in action:")
                print("   1. Open: https://meet.google.com/dnm-pkfq-dyi")
                print("   2. Join the meeting (mute/camera off is fine)")
                print("   3. Bot will join within 30 seconds")
                print("   4. You can leave and bot continues recording")
                print()
                print("🔄 Check status again after joining:")
                print(f"   curl -H 'Authorization: Bearer {token}' \\")
                print(f"        {BASE_URL}/bot/{bot_id}/status")
                
            elif status_data['status'] == 'in_call':
                print("🎉 Bot is actively recording!")
                print("   Someone joined the meeting and bot followed")
                
            elif status_data['status'] == 'done':
                print("✅ Bot finished recording!")
                print("   Meeting ended and recordings are available")
                
                # Check for download URLs
                download_response = requests.get(f"{BASE_URL}/bot/{bot_id}/download-urls", headers=headers)
                if download_response.status_code == 200:
                    download_data = download_response.json()
                    if download_data.get('video_url'):
                        print(f"   🎥 Video: Available")
                    if download_data.get('transcript_url'):
                        print(f"   📝 Transcript: Available")
        
        print(f"\n📖 Full API docs: {BASE_URL}/docs")
        print(f"🤖 Bot ID for testing: {bot_id}")
        
    else:
        print(f"❌ Failed to create bot: {response.status_code}")
        print(f"   Response: {response.text}")

if __name__ == "__main__":
    test_bot_behavior()
