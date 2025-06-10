"""
Client and SubClient data models
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Client(BaseModel):
    """Client organization model (Centralized Brain)"""
    
    id: Optional[str] = Field(None, description="Unique client identifier (UUID)")
    name: str = Field(..., description="Client organization name")
    description: Optional[str] = Field(None, description="Client description")
    user_id: str = Field(..., description="Owner user ID")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = Field(default=True, description="Whether client is active")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class SubClient(BaseModel):
    """Sub-client model (Project/Department within organization)"""
    
    id: Optional[str] = Field(None, description="Unique sub-client identifier (UUID)")
    name: str = Field(..., description="Sub-client name (project/department)")
    description: Optional[str] = Field(None, description="Sub-client description")
    client_id: str = Field(..., description="Parent client ID")
    contact_email: Optional[str] = Field(None, description="Contact email")
    contact_name: Optional[str] = Field(None, description="Contact person name")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = Field(default=True, description="Whether sub-client is active")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
