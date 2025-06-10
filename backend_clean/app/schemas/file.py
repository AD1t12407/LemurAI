"""
File and knowledge base schemas
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class FileResponse(BaseModel):
    """File response schema"""
    id: str = Field(..., description="File ID")
    filename: str = Field(..., description="Stored filename")
    original_filename: str = Field(..., description="Original filename")
    file_type: str = Field(..., description="File type/extension")
    file_size: int = Field(..., description="File size in bytes")
    client_id: str = Field(..., description="Associated client ID")
    sub_client_id: Optional[str] = Field(None, description="Associated sub-client ID")
    processed: bool = Field(..., description="Whether file has been processed")
    extracted_text: str = Field(..., description="Extracted text preview")
    chunks_stored: Optional[int] = Field(None, description="Number of chunks stored")
    created_at: str = Field(..., description="Upload timestamp")


class KnowledgeSearchRequest(BaseModel):
    """Knowledge base search request schema"""
    query: str = Field(..., min_length=3, max_length=500, description="Search query")
    client_id: str = Field(..., description="Client ID to search")
    sub_client_id: Optional[str] = Field(None, description="Sub-client ID to search")
    n_results: int = Field(default=5, ge=1, le=20, description="Number of results to return")


class KnowledgeSearchResult(BaseModel):
    """Individual search result schema"""
    text: str = Field(..., description="Relevant text content")
    metadata: Dict[str, Any] = Field(..., description="Document metadata")
    score: float = Field(..., description="Relevance score")


class KnowledgeSearchResponse(BaseModel):
    """Knowledge base search response schema"""
    results: List[KnowledgeSearchResult] = Field(..., description="Search results")
    query: str = Field(..., description="Original search query")
    total_results: int = Field(..., description="Total number of results")
