#!/usr/bin/env python3
"""
Test script for calendar integration
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USER_ID = "1"  # Demo user

def test_calendar_endpoints():
    """Test all calendar endpoints"""
    print("🧪 Testing Calendar Integration...")
    print("=" * 50)
    
    # Test 1: Debug calendar test
    print("\n1️⃣ Testing Recall AI Integration...")
    try:
        response = requests.get(f"{BASE_URL}/debug/calendar-test/{TEST_USER_ID}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Debug test successful")
            print(f"   📡 API Key configured: {data.get('recall_api_key_configured')}")
            print(f"   🔑 Auth test: {data.get('auth_test', {}).get('success')}")
            print(f"   📅 Meetings test: {data.get('meetings_test', {}).get('success')}")
            
            meetings_count = data.get('meetings_test', {}).get('meetings_count', 0)
            if meetings_count > 0:
                print(f"   📊 Found {meetings_count} meetings")
                sample = data.get('meetings_test', {}).get('sample_meeting')
                if sample:
                    print(f"   📝 Sample meeting: {sample.get('title', 'N/A')}")
        else:
            print(f"❌ Debug test failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Debug test error: {e}")
    
    # Test 2: Upcoming meetings
    print("\n2️⃣ Testing Upcoming Meetings...")
    try:
        response = requests.get(f"{BASE_URL}/calendar/upcoming/{TEST_USER_ID}")
        if response.status_code == 200:
            data = response.json()
            meetings = data.get('upcoming_meetings', [])
            print(f"✅ Upcoming meetings: {len(meetings)} found")
            for i, meeting in enumerate(meetings[:3]):  # Show first 3
                print(f"   📅 {i+1}. {meeting.get('title', 'N/A')} - {meeting.get('start_time', 'N/A')}")
        else:
            print(f"❌ Upcoming meetings failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Upcoming meetings error: {e}")
    
    # Test 3: Previous meetings
    print("\n3️⃣ Testing Previous Meetings...")
    try:
        response = requests.get(f"{BASE_URL}/calendar/previous/{TEST_USER_ID}")
        if response.status_code == 200:
            data = response.json()
            meetings = data.get('previous_meetings', [])
            print(f"✅ Previous meetings: {len(meetings)} found")
            for i, meeting in enumerate(meetings[:3]):  # Show first 3
                print(f"   📅 {i+1}. {meeting.get('title', 'N/A')} - {meeting.get('start_time', 'N/A')}")
        else:
            print(f"❌ Previous meetings failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Previous meetings error: {e}")
    
    # Test 4: Calendar auth token
    print("\n4️⃣ Testing Calendar Auth Token...")
    try:
        response = requests.post(f"{BASE_URL}/calendar/auth-token", 
                               json={"user_id": TEST_USER_ID})
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Auth token generated successfully")
            print(f"   🔑 Token: {data.get('token', 'N/A')[:20]}...")
            print(f"   ⏰ Expires: {data.get('expires_at', 'N/A')}")
        else:
            print(f"❌ Auth token failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Auth token error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Calendar Integration Test Complete!")

if __name__ == "__main__":
    test_calendar_endpoints()
