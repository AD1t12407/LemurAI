#!/usr/bin/env python3
"""
Quick test of the clean backend
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_basic_endpoints():
    """Test basic endpoints"""
    print("🧪 Quick Test of Lemur AI Clean Backend")
    print("=" * 50)
    
    # Test health
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test root
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Root endpoint passed")
            data = response.json()
            print(f"   App: {data.get('message', 'N/A')}")
            print(f"   Features: {len(data.get('features', []))} listed")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
    
    # Test debug endpoints
    try:
        response = requests.get(f"{BASE_URL}/debug/test")
        if response.status_code == 200:
            print("✅ Debug test endpoint passed")
            data = response.json()
            print(f"   Database: {data.get('database_connection', 'N/A')}")
        else:
            print(f"❌ Debug test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Debug test error: {e}")
    
    # Test authentication
    try:
        login_data = {
            "email": "demo@lemurai.com",
            "password": "demo1234"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            print("✅ Authentication passed")
            data = response.json()
            print(f"   User: {data['user']['name']}")
            print(f"   Token: {data['access_token'][:20]}...")
            return data['access_token']
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Authentication error: {e}")
    
    return None

def test_with_auth(token):
    """Test endpoints that require authentication"""
    if not token:
        print("⚠️  Skipping auth tests - no token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test getting clients
    try:
        response = requests.get(f"{BASE_URL}/clients/", headers=headers)
        if response.status_code == 200:
            print("✅ Get clients passed")
            clients = response.json()
            print(f"   Found {len(clients)} clients")
        else:
            print(f"❌ Get clients failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Get clients error: {e}")

def check_openapi():
    """Check OpenAPI documentation"""
    try:
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code == 200:
            openapi_spec = response.json()
            paths = openapi_spec.get("paths", {})
            print(f"✅ OpenAPI spec available")
            print(f"   Total endpoints: {len(paths)}")
            
            # Count endpoints by method
            method_counts = {}
            for path, methods in paths.items():
                for method in methods.keys():
                    method_counts[method.upper()] = method_counts.get(method.upper(), 0) + 1
            
            print(f"   Methods: {dict(method_counts)}")
            return True
        else:
            print(f"❌ OpenAPI spec failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ OpenAPI spec error: {e}")
        return False

if __name__ == "__main__":
    # Test basic endpoints
    token = test_basic_endpoints()
    
    print("\n" + "-" * 50)
    
    # Test authenticated endpoints
    test_with_auth(token)
    
    print("\n" + "-" * 50)
    
    # Check OpenAPI
    check_openapi()
    
    print("\n🎉 Quick test completed!")
    print(f"📖 Full API docs: {BASE_URL}/docs")
    print(f"❤️  Health check: {BASE_URL}/health")
