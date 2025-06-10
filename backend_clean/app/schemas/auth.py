"""
Authentication schemas
"""

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")


class RegisterRequest(BaseModel):
    """Registration request schema"""
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, max_length=100, description="User full name")
    password: str = Field(..., min_length=6, description="User password")


class UserResponse(BaseModel):
    """User response schema"""
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    name: str = Field(..., description="User name")


class AuthResponse(BaseModel):
    """Authentication response schema"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")
