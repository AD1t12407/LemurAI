"""
Authentication and security utilities
"""

import hashlib
import jwt as pyjwt
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.utils.config import get_settings
from app.core.database import db_manager
from app.models.user import User

settings = get_settings()
security = HTTPBearer()

# Demo users for testing (with proper UUIDs)
DEMO_USERS = {
    "demo@lemurai.com": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Demo User",
        "password": "demo1234",
        "created_at": "2024-01-01T00:00:00"
    },
    "aditi@synatechsolutions.com": {
        "id": "4a690bf1-9f02-4508-8612-e07c76524160",
        "name": "Aditi Sirigineedi", 
        "password": "synatech@Aditi",
        "created_at": "2024-01-01T00:00:00"
    },
    "amansanghi@synatechsolutions.com": {
        "id": "aa0c505f-cf90-467d-9548-ac6135c3aa00",
        "name": "Aman Sanghi",
        "password": "synatech@Aman",
        "created_at": "2024-01-01T00:00:00"
    }
}


def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == hashed_password


def create_access_token(user_id: str) -> str:
    """Create a JWT access token"""
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user_id,
        "exp": now + timedelta(hours=settings.jwt_expiration_hours),
        "iat": now
    }
    return pyjwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return user_id"""
    try:
        payload = pyjwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("user_id")
        return user_id
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except pyjwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user from JWT token"""
    token = credentials.credentials
    user_id = verify_token(token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    return user_id


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate user with email and password"""
    # First check database users (including demo users that should be stored)
    user = await db_manager.get_user_by_email(email)

    if user:
        # For demo users, check plain password; for regular users, check hashed password
        if email in DEMO_USERS:
            # Demo user - check plain password
            if DEMO_USERS[email]["password"] == password:
                return {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"]
                }
        elif user.get("password_hash"):
            # Regular user - check hashed password
            if verify_password(password, user["password_hash"]):
                return {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"]
                }

    # If user not found in database but is a demo user, create them
    if email in DEMO_USERS:
        demo_user = DEMO_USERS[email]
        if demo_user["password"] == password:
            # Create demo user in database
            try:
                user_model = User(
                    id=demo_user["id"],
                    email=email,
                    name=demo_user["name"],
                    created_at=datetime.fromisoformat(demo_user["created_at"]),
                    updated_at=datetime.fromisoformat(demo_user["created_at"])
                )

                result = await db_manager.create_user(user_model)
                if result:
                    return {
                        "id": result["id"],
                        "email": result["email"],
                        "name": result["name"]
                    }
            except Exception as e:
                print(f"⚠️  Error creating demo user in database: {e}")
                # Still return the demo user data even if DB creation fails
                return {
                    "id": demo_user["id"],
                    "email": email,
                    "name": demo_user["name"]
                }

    return None


async def create_user(email: str, name: str, password: str) -> dict:
    """Create a new user"""
    # Check if user already exists
    existing_user = await db_manager.get_user_by_email(email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create new user
    user = User(
        id=str(uuid.uuid4()),
        email=email,
        name=name,
        password_hash=hash_password(password),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    result = await db_manager.create_user(user)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    return {
        "id": result["id"],
        "email": result["email"],
        "name": result["name"]
    }


async def initialize_demo_users():
    """Initialize demo users in database"""
    for email, user_data in DEMO_USERS.items():
        try:
            existing = await db_manager.get_user_by_email(email)
            if not existing:
                user = User(
                    id=user_data["id"],
                    email=email,
                    name=user_data["name"],
                    created_at=datetime.fromisoformat(user_data["created_at"]),
                    updated_at=datetime.fromisoformat(user_data["created_at"])
                )
                await db_manager.create_user(user)
                print(f"✅ Demo user created: {email}")
            else:
                print(f"✅ Demo user exists: {email}")
        except Exception as e:
            print(f"⚠️  Error creating demo user {email}: {e}")
