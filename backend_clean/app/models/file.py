"""
File data model
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class File(BaseModel):
    """File model for document storage and processing"""
    
    id: Optional[str] = Field(None, description="Unique file identifier (UUID)")
    filename: str = Field(..., description="Stored filename (with UUID prefix)")
    original_filename: str = Field(..., description="Original uploaded filename")
    file_type: str = Field(..., description="File extension (.pdf, .docx, etc.)")
    file_size: int = Field(..., description="File size in bytes")
    storage_path: str = Field(..., description="File storage path")
    client_id: str = Field(..., description="Associated client ID")
    sub_client_id: Optional[str] = Field(None, description="Associated sub-client ID")
    user_id: str = Field(..., description="Uploader user ID")
    processed: bool = Field(default=False, description="Whether file has been processed")
    extracted_text: Optional[str] = Field(None, description="Extracted text content")
    chunks_stored: Optional[int] = Field(None, description="Number of text chunks stored")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
