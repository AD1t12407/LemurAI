"""
User data model
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class User(BaseModel):
    """User model for database operations"""
    
    id: str = Field(..., description="Unique user identifier (UUID)")
    email: str = Field(..., description="User email address")
    name: str = Field(..., description="User full name")
    password_hash: Optional[str] = Field(None, description="Hashed password")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = Field(default=True, description="Whether user account is active")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
