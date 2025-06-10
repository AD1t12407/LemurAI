#!/usr/bin/env python3
"""
Verify all endpoints are present and working
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# All required endpoints from your list
REQUIRED_ENDPOINTS = [
    # Root and Health
    ("GET", "/", "Root"),
    ("GET", "/health", "Health Check"),
    
    # Debug endpoints
    ("GET", "/debug/users", "Debug Users"),
    ("GET", "/debug/test", "Debug Test"),
    ("GET", "/debug/google-tokens", "Debug Google Tokens"),
    ("POST", "/debug/connect-user/{user_id}", "Manually Connect User"),
    
    # Authentication
    ("POST", "/auth/register", "Register User"),
    ("POST", "/auth/login", "Login User"),
    ("GET", "/auth/me", "Get Current User Profile"),
    ("GET", "/auth/google/calendar", "Initiate Google Calendar OAuth"),
    ("GET", "/auth/google/callback", "Google Calendar OAuth Callback"),
    
    # Calendar
    ("GET", "/calendar/google-events/{user_id}", "Get Google Calendar Events"),
    ("GET", "/calendar/upcoming/{user_id}", "Get Upcoming Meetings"),
    ("GET", "/calendar/previous/{user_id}", "Get Previous Meetings"),
    ("POST", "/calendar/auth-token", "Generate Calendar Auth Token"),
    ("POST", "/calendar/connect/google", "Initiate Google Calendar Connection"),
    ("GET", "/calendar/status/{user_id}", "Get Calendar Connection Status"),
    ("GET", "/calendar/events/{user_id}", "Get Calendar Events"),
    ("POST", "/calendar/events", "Create Calendar Event"),
    ("PUT", "/calendar/events/{event_id}", "Update Calendar Event"),
    ("DELETE", "/calendar/events/{event_id}", "Delete Calendar Event"),
    
    # Bots (Recall AI)
    ("POST", "/create-bot", "Create Bot"),
    ("GET", "/bot/{bot_id}/status", "Get Bot Status"),
    ("GET", "/bot/{bot_id}/download-urls", "Get Download URLs"),
    ("DELETE", "/bot/{bot_id}", "Remove Bot"),
    ("GET", "/bots", "List Active Bots"),
    ("POST", "/bots/cleanup", "Cleanup Old Bots"),
    
    # Additional endpoints from clean backend
    ("GET", "/clients/", "Get Clients"),
    ("POST", "/clients/", "Create Client"),
    ("POST", "/clients/{client_id}/sub-clients", "Create Sub-Client"),
    ("GET", "/clients/{client_id}/sub-clients", "Get Sub-Clients"),
    ("POST", "/files/upload", "Upload File"),
    ("POST", "/files/search", "Search Knowledge Base"),
    ("POST", "/ai/generate", "Generate AI Content"),
    ("POST", "/ai/email", "Generate Email"),
    ("POST", "/ai/summary", "Generate Summary"),
    ("POST", "/ai/proposal", "Generate Proposal"),
]

def check_endpoint_exists(method, path, description):
    """Check if endpoint exists by examining OpenAPI docs"""
    try:
        # Get OpenAPI spec
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code != 200:
            return False, "Cannot access OpenAPI spec"
        
        openapi_spec = response.json()
        paths = openapi_spec.get("paths", {})
        
        # Convert path with parameters to OpenAPI format
        openapi_path = path
        if "{" in path:
            # Convert {user_id} to {user_id} format (already correct)
            pass
        
        # Check if path exists
        if openapi_path in paths:
            path_methods = paths[openapi_path]
            if method.lower() in path_methods:
                return True, "Endpoint exists"
            else:
                return False, f"Method {method} not found for path"
        else:
            # Try to find similar paths
            similar_paths = [p for p in paths.keys() if p.replace("{", "").replace("}", "") in openapi_path.replace("{", "").replace("}", "")]
            if similar_paths:
                return False, f"Path not found, similar: {similar_paths[0]}"
            else:
                return False, "Path not found"
                
    except Exception as e:
        return False, f"Error checking endpoint: {e}"

def verify_all_endpoints():
    """Verify all required endpoints are present"""
    print("🔍 Verifying All Required Endpoints")
    print("=" * 60)
    
    # First check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Server is not responding properly")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print(f"   Make sure server is running at {BASE_URL}")
        return False
    
    print("✅ Server is running")
    print()
    
    # Check each endpoint
    missing_endpoints = []
    present_endpoints = []
    
    for method, path, description in REQUIRED_ENDPOINTS:
        exists, message = check_endpoint_exists(method, path, description)
        
        if exists:
            present_endpoints.append((method, path, description))
            print(f"✅ {method:6} {path:40} - {description}")
        else:
            missing_endpoints.append((method, path, description, message))
            print(f"❌ {method:6} {path:40} - {description} ({message})")
    
    print("\n" + "=" * 60)
    print(f"📊 Endpoint Verification Results:")
    print(f"   ✅ Present: {len(present_endpoints)}")
    print(f"   ❌ Missing: {len(missing_endpoints)}")
    print(f"   📈 Coverage: {len(present_endpoints)}/{len(REQUIRED_ENDPOINTS)} ({len(present_endpoints)/len(REQUIRED_ENDPOINTS)*100:.1f}%)")
    
    if missing_endpoints:
        print(f"\n❌ Missing Endpoints:")
        for method, path, description, message in missing_endpoints:
            print(f"   {method} {path} - {description}")
            print(f"      Reason: {message}")
    
    if len(present_endpoints) == len(REQUIRED_ENDPOINTS):
        print("\n🎉 All required endpoints are present!")
        return True
    else:
        print(f"\n⚠️  {len(missing_endpoints)} endpoints are missing")
        return False

def show_available_endpoints():
    """Show all available endpoints from OpenAPI spec"""
    try:
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code == 200:
            openapi_spec = response.json()
            paths = openapi_spec.get("paths", {})
            
            print("\n📋 All Available Endpoints:")
            print("-" * 60)
            
            for path, methods in sorted(paths.items()):
                for method, details in methods.items():
                    summary = details.get("summary", "No description")
                    print(f"{method.upper():6} {path:40} - {summary}")
        
    except Exception as e:
        print(f"❌ Error getting available endpoints: {e}")

if __name__ == "__main__":
    success = verify_all_endpoints()
    
    if not success:
        print("\n🔍 Showing all available endpoints for comparison:")
        show_available_endpoints()
    
    exit(0 if success else 1)
