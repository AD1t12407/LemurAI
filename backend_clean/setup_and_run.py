#!/usr/bin/env python3
"""
Setup and run script for clean Lemur AI backend
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def run_command(command, description):
    """Run a command and return success status"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def setup_environment():
    """Set up the development environment"""
    print("🏗️  Setting up Lemur AI Clean Backend")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("main.py").exists():
        print("❌ Please run this script from the backend_clean directory")
        return False
    
    # Create virtual environment
    if not Path("venv").exists():
        if not run_command("python3 -m venv venv", "Creating virtual environment"):
            return False
    
    # Activate virtual environment and install dependencies
    if sys.platform == "win32":
        pip_cmd = "venv\\Scripts\\pip"
        python_cmd = "venv\\Scripts\\python"
    else:
        pip_cmd = "venv/bin/pip"
        python_cmd = "venv/bin/python"
    
    if not run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip"):
        return False
    
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Migrate data
    if not run_command(f"{python_cmd} migrate_data.py", "Migrating data"):
        print("⚠️  Data migration failed, but continuing...")
    
    print("✅ Environment setup completed!")
    return True

def start_server():
    """Start the Lemur AI server"""
    print("\n🚀 Starting Lemur AI Server...")
    
    if sys.platform == "win32":
        python_cmd = "venv\\Scripts\\python"
    else:
        python_cmd = "venv/bin/python"
    
    try:
        # Start server
        print("📖 Server will be available at: http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("❤️  Health Check: http://localhost:8000/health")
        print("\n🔄 Starting server (press Ctrl+C to stop)...")
        
        subprocess.run([python_cmd, "main.py"], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        return False
    
    return True

def run_tests():
    """Run the test suite"""
    print("\n🧪 Running Test Suite...")
    
    if sys.platform == "win32":
        python_cmd = "venv\\Scripts\\python"
    else:
        python_cmd = "venv/bin/python"
    
    # Wait a moment for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(3)
    
    return run_command(f"{python_cmd} test_complete_backend.py", "Running comprehensive tests")

def main():
    """Main setup and run function"""
    print("🎯 Lemur AI - Clean Backend Setup & Launch")
    print("=" * 60)
    
    # Setup environment
    if not setup_environment():
        print("❌ Environment setup failed")
        return False
    
    # Ask user what to do
    print("\n🎮 What would you like to do?")
    print("1. Start server")
    print("2. Run tests (requires server to be running)")
    print("3. Start server and run tests")
    print("4. Exit")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == "1":
        return start_server()
    elif choice == "2":
        return run_tests()
    elif choice == "3":
        print("🔄 Starting server in background and running tests...")
        # This would require more complex process management
        print("⚠️  Please start the server manually first, then run tests")
        return False
    elif choice == "4":
        print("👋 Goodbye!")
        return True
    else:
        print("❌ Invalid choice")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
