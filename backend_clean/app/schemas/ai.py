"""
AI content generation schemas
"""

from typing import Optional
from pydantic import BaseModel, Field


class AIGenerationRequest(BaseModel):
    """AI content generation request schema"""
    prompt: str = Field(..., min_length=10, max_length=2000, description="Generation prompt")
    content_type: str = Field(..., description="Type: email, summary, proposal, scope_of_work, action_items")
    client_id: str = Field(..., description="Client ID for context")
    sub_client_id: Optional[str] = Field(None, description="Sub-client ID for context")
    additional_instructions: Optional[str] = Field(None, max_length=500, description="Additional instructions")
    recipient_name: Optional[str] = Field(None, description="Recipient name (for emails)")
    sender_name: Optional[str] = Field(None, description="Sender name (for emails)")


class AIGenerationResponse(BaseModel):
    """AI content generation response schema"""
    id: str = Field(..., description="Output ID")
    content: str = Field(..., description="Generated content")
    content_type: str = Field(..., description="Content type")
    prompt: str = Field(..., description="Original prompt")
    client_id: str = Field(..., description="Client ID")
    sub_client_id: Optional[str] = Field(None, description="Sub-client ID")
    context_used: str = Field(..., description="Context from knowledge base")
    tokens_used: int = Field(default=0, description="Tokens used for generation")
    created_at: str = Field(..., description="Generation timestamp")


class EmailGenerationRequest(BaseModel):
    """Email generation request schema"""
    prompt: str = Field(..., min_length=10, max_length=1000, description="Email prompt")
    client_id: str = Field(..., description="Client ID for context")
    sub_client_id: Optional[str] = Field(None, description="Sub-client ID for context")
    recipient_name: str = Field(..., description="Email recipient name")
    sender_name: str = Field(..., description="Email sender name")


class SummaryGenerationRequest(BaseModel):
    """Summary generation request schema"""
    prompt: str = Field(..., min_length=10, max_length=2000, description="Summary prompt")
    client_id: str = Field(..., description="Client ID for context")
    sub_client_id: Optional[str] = Field(None, description="Sub-client ID for context")
    meeting_id: Optional[str] = Field(None, description="Associated meeting ID")


class ProposalGenerationRequest(BaseModel):
    """Proposal generation request schema"""
    prompt: str = Field(..., min_length=10, max_length=2000, description="Proposal prompt")
    client_id: str = Field(..., description="Client ID for context")
    sub_client_id: Optional[str] = Field(None, description="Sub-client ID for context")


class ScopeOfWorkRequest(BaseModel):
    """Scope of work generation request schema"""
    prompt: str = Field(..., min_length=10, max_length=2000, description="Scope of work prompt")
    client_id: str = Field(..., description="Client ID for context")
    sub_client_id: Optional[str] = Field(None, description="Sub-client ID for context")
