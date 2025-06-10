#!/usr/bin/env python3
"""
Monitor bot status in real-time
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

RECALL_API_KEY = os.getenv("RECALL_API_KEY")
BASE_URL = "https://us-west-2.recall.ai/api/v1"

def monitor_bot_status(bot_id):
    """Monitor a bot's status in real-time"""
    print(f"🔍 Monitoring Bot: {bot_id}")
    print("=" * 60)
    
    headers = {
        "Authorization": f"Token {RECALL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    previous_status = None
    previous_status_changes_count = 0
    
    for i in range(20):  # Monitor for 20 iterations (about 2 minutes)
        try:
            response = requests.get(f'{BASE_URL}/bot/{bot_id}', headers=headers)
            if response.status_code == 200:
                bot_data = response.json()
                
                # Analyze status
                status_changes = bot_data.get('status_changes', [])
                current_status_changes_count = len(status_changes)
                
                if status_changes:
                    current_status = status_changes[-1].get('code', 'unknown')
                else:
                    recordings = bot_data.get('recordings', [])
                    if recordings:
                        current_status = 'done'
                    else:
                        current_status = 'waiting_to_join'
                
                # Only print if status changed
                if (current_status != previous_status or 
                    current_status_changes_count != previous_status_changes_count):
                    
                    timestamp = time.strftime("%H:%M:%S")
                    print(f"[{timestamp}] Status: {current_status}")
                    print(f"           Status changes: {current_status_changes_count}")
                    
                    if status_changes:
                        print("           Recent changes:")
                        for change in status_changes[-3:]:  # Show last 3 changes
                            print(f"             - {change}")
                    
                    recordings = bot_data.get('recordings', [])
                    if recordings:
                        print(f"           Recordings: {len(recordings)} available")
                    
                    print()
                    
                    previous_status = current_status
                    previous_status_changes_count = current_status_changes_count
                
                # Check if bot is done
                if current_status in ['done', 'failed', 'fatal']:
                    print(f"🎉 Bot finished with status: {current_status}")
                    break
                    
            else:
                print(f"❌ Failed to get bot status: {response.status_code}")
                break
                
        except Exception as e:
            print(f"❌ Error monitoring bot: {e}")
            break
        
        time.sleep(6)  # Wait 6 seconds between checks
    
    print("\n📊 Final Status Check:")
    try:
        response = requests.get(f'{BASE_URL}/bot/{bot_id}', headers=headers)
        if response.status_code == 200:
            bot_data = response.json()
            print(json.dumps(bot_data, indent=2))
    except Exception as e:
        print(f"❌ Error getting final status: {e}")

def check_meeting_room_status():
    """Check if anyone is in the meeting room"""
    print("\n🏠 Meeting Room Status:")
    print("=" * 40)
    print("Meeting URL: https://meet.google.com/dnm-pkfq-dyi")
    print()
    print("💡 To test the bot properly:")
    print("   1. Open the meeting link in your browser")
    print("   2. Join the meeting (you can mute/turn off camera)")
    print("   3. The bot should then join automatically")
    print("   4. You can leave the meeting and the bot will record")
    print()
    print("🤖 Bot Behavior:")
    print("   - Bots wait for human participants to join first")
    print("   - Empty meetings won't trigger bot joining")
    print("   - Once someone joins, bot joins within ~30 seconds")

if __name__ == "__main__":
    # Use the bot ID from the previous test
    bot_id = "91a5ca2d-5897-4bb5-98a8-cb60b09608ed"
    
    print("🤖 Recall AI Bot Monitor")
    print("=" * 60)
    
    check_meeting_room_status()
    
    print(f"\n🔍 Starting monitoring for bot: {bot_id}")
    print("Press Ctrl+C to stop monitoring")
    
    try:
        monitor_bot_status(bot_id)
    except KeyboardInterrupt:
        print("\n⏹️  Monitoring stopped by user")
    
    print("\n✅ Monitoring complete!")
