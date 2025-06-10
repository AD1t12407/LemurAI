"""
AI content generation API routes
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.core.auth import get_current_user
from app.core.database import db_manager
from app.core.ai_service import (
    generate_content, generate_email, generate_summary,
    generate_proposal, generate_scope_of_work, generate_action_items
)
from app.models.output import Output
from app.schemas.ai import (
    AIGenerationRequest, AIGenerationResponse,
    EmailGenerationRequest, SummaryGenerationRequest,
    ProposalGenerationRequest, ScopeOfWorkRequest
)

router = APIRouter()


@router.post("/generate", response_model=AIGenerationResponse)
async def generate_ai_content(
    request: AIGenerationRequest,
    current_user_id: str = Depends(get_current_user)
):
    """
    Generate AI content using company knowledge base
    
    This is the core of the "Centralized Brain" - it uses stored knowledge
    to generate personalized, contextual content.
    """
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == request.client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to generate content for this client"
        )
    
    try:
        # Generate content using AI service
        generation_result = await generate_content(
            prompt=request.prompt,
            content_type=request.content_type,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            additional_instructions=request.additional_instructions,
            recipient_name=request.recipient_name,
            sender_name=request.sender_name
        )
        
        if not generation_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate content: {generation_result.get('error', 'Unknown error')}"
            )
        
        # Create output record
        output = Output(
            id=str(uuid.uuid4()),
            title=f"{request.content_type.title()} - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            content=generation_result["content"],
            output_type=request.content_type,
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            user_id=current_user_id,
            context_used=generation_result.get("context_used", ""),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Save to database
        result = await db_manager.create_output(output)
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to save generated content"
            )
        
        return AIGenerationResponse(
            id=result["id"],
            content=result["content"],
            content_type=result["output_type"],
            prompt=result["prompt"],
            client_id=result["client_id"],
            sub_client_id=result.get("sub_client_id"),
            context_used=generation_result.get("context_used", ""),
            tokens_used=generation_result.get("tokens_used", 0),
            created_at=result["created_at"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate content: {str(e)}"
        )


@router.post("/email", response_model=AIGenerationResponse)
async def generate_follow_up_email(
    request: EmailGenerationRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Generate personalized follow-up email"""
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == request.client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to generate emails for this client"
        )
    
    try:
        generation_result = await generate_email(
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            recipient_name=request.recipient_name,
            sender_name=request.sender_name
        )
        
        if not generation_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate email: {generation_result.get('error', 'Unknown error')}"
            )
        
        # Save output
        output = Output(
            id=str(uuid.uuid4()),
            title=f"Follow-up Email to {request.recipient_name}",
            content=generation_result["content"],
            output_type="email",
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            user_id=current_user_id,
            context_used=generation_result.get("context_used", ""),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        result = await db_manager.create_output(output)
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to save generated email"
            )
        
        return AIGenerationResponse(
            id=result["id"],
            content=result["content"],
            content_type="email",
            prompt=result["prompt"],
            client_id=result["client_id"],
            sub_client_id=result.get("sub_client_id"),
            context_used=generation_result.get("context_used", ""),
            tokens_used=generation_result.get("tokens_used", 0),
            created_at=result["created_at"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate email: {str(e)}"
        )


@router.post("/summary", response_model=AIGenerationResponse)
async def generate_meeting_summary(
    request: SummaryGenerationRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Generate meeting summary with action items"""
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == request.client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to generate summaries for this client"
        )
    
    try:
        generation_result = await generate_summary(
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id
        )
        
        if not generation_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate summary: {generation_result.get('error', 'Unknown error')}"
            )
        
        # Save output
        output = Output(
            id=str(uuid.uuid4()),
            title=f"Meeting Summary - {datetime.now().strftime('%Y-%m-%d')}",
            content=generation_result["content"],
            output_type="summary",
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            user_id=current_user_id,
            meeting_id=request.meeting_id,
            context_used=generation_result.get("context_used", ""),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        result = await db_manager.create_output(output)
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to save generated summary"
            )
        
        return AIGenerationResponse(
            id=result["id"],
            content=result["content"],
            content_type="summary",
            prompt=result["prompt"],
            client_id=result["client_id"],
            sub_client_id=result.get("sub_client_id"),
            context_used=generation_result.get("context_used", ""),
            tokens_used=generation_result.get("tokens_used", 0),
            created_at=result["created_at"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}"
        )


@router.post("/proposal", response_model=AIGenerationResponse)
async def generate_project_proposal(
    request: ProposalGenerationRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Generate project proposal using company knowledge"""
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == request.client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to generate proposals for this client"
        )
    
    try:
        generation_result = await generate_proposal(
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id
        )
        
        if not generation_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate proposal: {generation_result.get('error', 'Unknown error')}"
            )
        
        # Save output
        output = Output(
            id=str(uuid.uuid4()),
            title=f"Project Proposal - {datetime.now().strftime('%Y-%m-%d')}",
            content=generation_result["content"],
            output_type="proposal",
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            user_id=current_user_id,
            context_used=generation_result.get("context_used", ""),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        result = await db_manager.create_output(output)
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to save generated proposal"
            )
        
        return AIGenerationResponse(
            id=result["id"],
            content=result["content"],
            content_type="proposal",
            prompt=result["prompt"],
            client_id=result["client_id"],
            sub_client_id=result.get("sub_client_id"),
            context_used=generation_result.get("context_used", ""),
            tokens_used=generation_result.get("tokens_used", 0),
            created_at=result["created_at"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate proposal: {str(e)}"
        )


@router.post("/action-items", response_model=AIGenerationResponse)
async def generate_action_items(
    request: AIGenerationRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Generate action items from meeting content"""
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == request.client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to generate content for this client"
        )

    try:
        # Generate action items using AI service
        result = generate_action_items(
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id
        )

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate action items: {result.get('error', 'Unknown error')}"
            )

        # Store the generated content
        output_id = str(uuid.uuid4())
        output = Output(
            id=output_id,
            user_id=current_user_id,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            content_type="action_items",
            prompt=request.prompt,
            generated_content=result["content"],
            context_used=result.get("context_used", ""),
            created_at=datetime.utcnow().isoformat()
        )

        await db_manager.store_output(output)

        return AIGenerationResponse(
            id=output_id,
            content=result["content"],
            content_type="action_items",
            prompt=request.prompt,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            context_used=result.get("context_used", ""),
            created_at=output.created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate action items: {str(e)}"
        )
