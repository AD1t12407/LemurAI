#!/usr/bin/env python3
"""
Manual verification of the complete workflow
Provides curl commands and verification steps
"""

print("🧪 Lemur AI - Complete Workflow Manual Verification")
print("=" * 60)

print("""
The server is running at: http://localhost:8000

🔍 STEP 1: Verify Server Health
Open in browser: http://localhost:8000/health
Expected: {"status": "healthy", "app": "Lemur AI", ...}

🔍 STEP 2: Check API Documentation  
Open in browser: http://localhost:8000/docs
Expected: Full Swagger UI with all endpoints

🔍 STEP 3: Test Authentication
curl -X POST "http://localhost:8000/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "demo@lemurai.com", "password": "demo1234"}'

Expected Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer", 
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "demo@lemurai.com",
    "name": "Demo User"
  }
}

🔍 STEP 4: Verify User in Database
curl -X GET "http://localhost:8000/auth/me" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

Expected: User details confirming storage in database

🔍 STEP 5: Create Client (Centralized Brain)
curl -X POST "http://localhost:8000/clients/" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{"name": "Test Company", "description": "Testing centralized brain"}'

Expected: Client created with UUID linked to user

🔍 STEP 6: Create Sub-Client
curl -X POST "http://localhost:8000/clients/CLIENT_ID/sub-clients" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{"name": "AI Project", "description": "Testing sub-client"}'

🔍 STEP 7: Upload File (Build Knowledge Base)
curl -X POST "http://localhost:8000/files/upload" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -F "client_id=CLIENT_ID" \\
  -F "sub_client_id=SUB_CLIENT_ID" \\
  -F "file=@test_document.txt"

Expected: File processed and chunks stored in vector database

🔍 STEP 8: Search Knowledge Base
curl -X POST "http://localhost:8000/files/search" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{"query": "project details", "client_id": "CLIENT_ID", "n_results": 3}'

Expected: Relevant search results from uploaded documents

🔍 STEP 9: Generate AI Content
curl -X POST "http://localhost:8000/ai/generate" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{
    "prompt": "Create a summary of our project",
    "content_type": "summary", 
    "client_id": "CLIENT_ID"
  }'

Expected: AI-generated content using company knowledge

🔍 STEP 10: Generate Email
curl -X POST "http://localhost:8000/ai/email" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{
    "prompt": "Write follow-up email about project progress",
    "client_id": "CLIENT_ID",
    "recipient_name": "Client",
    "sender_name": "Project Manager"
  }'

Expected: Personalized email using company context

🔍 STEP 11: Test Bot Management
curl -X POST "http://localhost:8000/create-bot" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -d '{"meeting_url": "https://zoom.us/j/123", "bot_name": "Test Bot"}'

Expected: Bot creation response (may be placeholder)

🔍 STEP 12: Debug Endpoints
curl -X GET "http://localhost:8000/debug/users"
curl -X GET "http://localhost:8000/debug/test"

Expected: Debug information about users and system status
""")

print("\n🎯 Key Verification Points:")
print("✅ User UUID is consistent across all operations")
print("✅ Client is linked to authenticated user")
print("✅ Files are processed and stored with proper user/client association")
print("✅ AI generation uses user's specific knowledge base")
print("✅ All operations respect user isolation")

print("\n📖 Full API Documentation: http://localhost:8000/docs")
print("❤️  Health Check: http://localhost:8000/health")

# Test if we can at least connect to the server
try:
    import requests
    response = requests.get("http://localhost:8000/health", timeout=2)
    if response.status_code == 200:
        print("\n✅ Server is responding!")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   App: {data.get('app')}")
        print(f"   Version: {data.get('version')}")
    else:
        print(f"\n⚠️  Server responded with status: {response.status_code}")
except Exception as e:
    print(f"\n❌ Cannot connect to server: {e}")
    print("   Make sure the server is running: python main.py")

print("\n🚀 Ready to test the complete workflow!")
