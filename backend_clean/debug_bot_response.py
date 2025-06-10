#!/usr/bin/env python3
"""
Debug bot response to understand the structure
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

RECALL_API_KEY = os.getenv("RECALL_API_KEY")
BASE_URL = "https://us-west-2.recall.ai/api/v1"

def debug_bot_response():
    """Debug the actual bot response structure"""
    print("🔍 Debug Bot Response Structure")
    print("=" * 50)
    
    headers = {
        "Authorization": f"Token {RECALL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Create a test bot
    print("🤖 Creating test bot...")
    bot_config = {
        'meeting_url': "https://meet.google.com/dnm-pkfq-dyi",
        'bot_name': "Debug Bot"
    }
    
    response = requests.post(f'{BASE_URL}/bot', json=bot_config, headers=headers)
    if response.status_code == 201:
        bot_data = response.json()
        bot_id = bot_data['id']
        print(f"✅ Bot created: {bot_id}")
        
        print("\n📋 Full Bot Creation Response:")
        print(json.dumps(bot_data, indent=2))
        
        # Get bot details
        print(f"\n🔍 Getting bot details...")
        detail_response = requests.get(f'{BASE_URL}/bot/{bot_id}', headers=headers)
        if detail_response.status_code == 200:
            detail_data = detail_response.json()
            print("\n📋 Full Bot Details Response:")
            print(json.dumps(detail_data, indent=2))
            
            # Analyze status
            print("\n📊 Status Analysis:")
            status_changes = detail_data.get('status_changes', [])
            print(f"   Status changes count: {len(status_changes)}")
            if status_changes:
                for i, change in enumerate(status_changes):
                    print(f"   Change {i+1}: {change}")
            else:
                print("   No status changes found")
            
            # Check for other status fields
            print("\n🔍 Looking for status in other fields:")
            for key, value in detail_data.items():
                if 'status' in key.lower():
                    print(f"   {key}: {value}")
        
        # Test delete with different methods
        print(f"\n🗑️  Testing delete methods...")
        
        # Method 1: DELETE request
        print("   Method 1: DELETE request")
        delete_response = requests.delete(f'{BASE_URL}/bot/{bot_id}', headers=headers)
        print(f"   Status: {delete_response.status_code}")
        print(f"   Response: {delete_response.text}")
        
        if delete_response.status_code != 204:
            # Method 2: POST to stop endpoint
            print("   Method 2: POST to stop endpoint")
            stop_response = requests.post(f'{BASE_URL}/bot/{bot_id}/stop', headers=headers)
            print(f"   Status: {stop_response.status_code}")
            print(f"   Response: {stop_response.text}")
            
            if stop_response.status_code != 200:
                # Method 3: PATCH to update status
                print("   Method 3: PATCH to update status")
                patch_response = requests.patch(f'{BASE_URL}/bot/{bot_id}', 
                                              json={"status": "stopped"}, headers=headers)
                print(f"   Status: {patch_response.status_code}")
                print(f"   Response: {patch_response.text}")
    
    else:
        print(f"❌ Failed to create bot: {response.status_code}")
        print(f"   Response: {response.text}")

if __name__ == "__main__":
    debug_bot_response()
