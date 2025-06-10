"""
AI Output data model
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Output(BaseModel):
    """AI-generated content output model"""
    
    id: Optional[str] = Field(None, description="Unique output identifier (UUID)")
    title: str = Field(..., description="Output title/name")
    content: str = Field(..., description="Generated content")
    output_type: str = Field(..., description="Type: email, summary, proposal, etc.")
    prompt: str = Field(..., description="Original prompt used")
    client_id: str = Field(..., description="Associated client ID")
    sub_client_id: Optional[str] = Field(None, description="Associated sub-client ID")
    user_id: str = Field(..., description="User who generated the content")
    file_id: Optional[str] = Field(None, description="Source file ID if applicable")
    meeting_id: Optional[str] = Field(None, description="Source meeting ID if applicable")
    context_used: Optional[str] = Field(None, description="Context/knowledge used for generation")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
