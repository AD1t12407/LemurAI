#!/usr/bin/env python3
"""
Debug Recall AI API directly
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

RECALL_API_KEY = os.getenv("RECALL_API_KEY")
BASE_URL = "https://us-west-2.recall.ai/api/v1"

def test_recall_api_directly():
    """Test Recall AI API directly to debug the issue"""
    print("🔍 Debug Recall AI API Direct Call")
    print("=" * 50)
    
    if not RECALL_API_KEY:
        print("❌ RECALL_API_KEY not found in environment")
        return False
    
    print(f"✅ API Key found: {RECALL_API_KEY[:10]}...")
    print(f"🌐 Base URL: {BASE_URL}")
    
    headers = {
        "Authorization": f"Token {RECALL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Simple payload
    print("\n🧪 Test 1: Simple payload")
    simple_payload = {
        "meeting_url": "https://meet.google.com/abc-defg-hij",
        "bot_name": "Debug Test Bot"
    }
    
    print(f"📤 Request:")
    print(f"   URL: {BASE_URL}/bot")
    print(f"   Headers: {headers}")
    print(f"   Payload: {json.dumps(simple_payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/bot",
            headers=headers,
            json=simple_payload,
            timeout=30
        )
        
        print(f"\n📥 Response:")
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Body: {response.text}")
        
        if response.status_code == 201:
            print("✅ Simple payload worked!")
            return True
        else:
            print("❌ Simple payload failed")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test 2: Full payload
    print("\n🧪 Test 2: Full payload")
    full_payload = {
        "meeting_url": "https://meet.google.com/abc-defg-hij",
        "bot_name": "Debug Test Bot Full",
        "transcription_options": {
            "provider": "assembly_ai"
        },
        "recording_mode": "speaker_view",
        "recording_mode_options": {
            "participant_video_when_screenshare": True
        },
        "real_time_transcription": {
            "destination_url": None,
            "partial_results": True
        },
        "automatic_leave": {
            "waiting_room_timeout": 1200,
            "noone_joined_timeout": 1200
        }
    }
    
    print(f"📤 Request:")
    print(f"   Payload: {json.dumps(full_payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/bot",
            headers=headers,
            json=full_payload,
            timeout=30
        )
        
        print(f"\n📥 Response:")
        print(f"   Status: {response.status_code}")
        print(f"   Body: {response.text}")
        
        if response.status_code == 201:
            print("✅ Full payload worked!")
            return True
        else:
            print("❌ Full payload failed")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test 3: Check API key validity by listing bots
    print("\n🧪 Test 3: Check API key validity")
    try:
        response = requests.get(
            f"{BASE_URL}/bot",
            headers=headers,
            timeout=30
        )
        
        print(f"📥 List bots response:")
        print(f"   Status: {response.status_code}")
        print(f"   Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ API key is valid!")
            bots_data = response.json()
            print(f"   Found {bots_data.get('count', 0)} existing bots")
        else:
            print("❌ API key might be invalid")
            
    except Exception as e:
        print(f"❌ List request failed: {e}")
    
    return False

def test_different_meeting_urls():
    """Test with different meeting URL formats"""
    print("\n🔗 Testing Different Meeting URL Formats")
    print("=" * 50)
    
    headers = {
        "Authorization": f"Token {RECALL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    test_urls = [
        "https://meet.google.com/abc-defg-hij",
        "https://zoom.us/j/1234567890",
        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_test",
        "https://us02web.zoom.us/j/1234567890?pwd=test"
    ]
    
    for i, url in enumerate(test_urls, 1):
        print(f"\n🧪 Test {i}: {url}")
        
        payload = {
            "meeting_url": url,
            "bot_name": f"Test Bot {i}"
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/bot",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            print(f"   Status: {response.status_code}")
            if response.status_code != 201:
                print(f"   Error: {response.text}")
            else:
                print("   ✅ Success!")
                # Clean up - delete the bot
                bot_data = response.json()
                bot_id = bot_data.get("id")
                if bot_id:
                    requests.delete(f"{BASE_URL}/bot/{bot_id}", headers=headers)
                    print(f"   🧹 Cleaned up bot {bot_id}")
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")

if __name__ == "__main__":
    print("🔍 Recall AI API Debug Tool")
    print("=" * 60)
    
    success = test_recall_api_directly()
    
    if not success:
        test_different_meeting_urls()
    
    print("\n" + "=" * 60)
    print("🎯 Debug Summary:")
    print("   - Check the response details above")
    print("   - Verify API key is correct")
    print("   - Check meeting URL format")
    print("   - Review Recall AI API documentation")
