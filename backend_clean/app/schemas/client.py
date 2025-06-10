"""
Client management schemas
"""

from typing import Optional
from pydantic import BaseModel, Field


class ClientCreateRequest(BaseModel):
    """Client creation request schema"""
    name: str = Field(..., min_length=2, max_length=200, description="Client organization name")
    description: Optional[str] = Field(None, max_length=1000, description="Client description")


class ClientResponse(BaseModel):
    """Client response schema"""
    id: str = Field(..., description="Client ID")
    name: str = Field(..., description="Client name")
    description: Optional[str] = Field(None, description="Client description")
    user_id: str = Field(..., description="Owner user ID")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
    is_active: bool = Field(..., description="Whether client is active")


class SubClientCreateRequest(BaseModel):
    """Sub-client creation request schema"""
    name: str = Field(..., min_length=2, max_length=200, description="Sub-client name")
    description: Optional[str] = Field(None, max_length=1000, description="Sub-client description")
    contact_email: Optional[str] = Field(None, description="Contact email")
    contact_name: Optional[str] = Field(None, description="Contact person name")


class SubClientResponse(BaseModel):
    """Sub-client response schema"""
    id: str = Field(..., description="Sub-client ID")
    name: str = Field(..., description="Sub-client name")
    description: Optional[str] = Field(None, description="Sub-client description")
    client_id: str = Field(..., description="Parent client ID")
    contact_email: Optional[str] = Field(None, description="Contact email")
    contact_name: Optional[str] = Field(None, description="Contact person name")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
    is_active: bool = Field(..., description="Whether sub-client is active")
