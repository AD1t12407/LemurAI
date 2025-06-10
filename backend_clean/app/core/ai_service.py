"""
AI/LLM service for content generation
"""

import logging
from typing import Dict, Any, Optional
from openai import OpenAI
from app.utils.config import get_settings
from app.core.vector_store import search_knowledge_base

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize OpenAI client
client = OpenAI(api_key=settings.openai_api_key)


async def generate_content(
    prompt: str,
    content_type: str,
    client_id: str,
    sub_client_id: Optional[str] = None,
    additional_instructions: Optional[str] = None,
    recipient_name: Optional[str] = None,
    sender_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate AI content using company knowledge base
    
    This is the core of the "Centralized Brain" - it searches the knowledge base
    for relevant context and generates personalized content.
    """
    try:
        # Search knowledge base for relevant context
        context_results = search_knowledge_base(
            query=prompt,
            client_id=client_id,
            sub_client_id=sub_client_id,
            n_results=5
        )
        
        # Build context from search results
        context = ""
        if context_results:
            context = "\n\n".join([
                f"Context {i+1}: {result['text']}"
                for i, result in enumerate(context_results[:3])
            ])
        
        # Build system prompt based on content type
        system_prompts = {
            "email": f"""You are an AI assistant helping to write professional emails for an IT consulting firm.
Use the provided context from the company's knowledge base to write personalized, relevant emails.
Include specific details from past projects and successful patterns when relevant.
Recipient: {recipient_name or 'Client'}
Sender: {sender_name or 'Consultant'}""",
            
            "summary": """You are an AI assistant creating executive summaries for an IT consulting firm.
Use the provided context to create comprehensive, actionable summaries.
Focus on key insights, metrics, and business outcomes.""",
            
            "proposal": """You are an AI assistant creating project proposals for an IT consulting firm.
Use the provided context from past successful projects to create compelling proposals.
Include technical approach, timeline estimates, and proven methodologies.""",
            
            "scope_of_work": """You are an AI assistant creating scope of work documents for IT projects.
Use the provided context to define clear deliverables, milestones, and acceptance criteria.
Reference similar successful projects and proven approaches.""",
            
            "action_items": """You are an AI assistant extracting and prioritizing action items.
Use the provided context to create specific, actionable tasks with clear ownership and deadlines."""
        }
        
        system_prompt = system_prompts.get(content_type, system_prompts["summary"])
        
        if additional_instructions:
            system_prompt += f"\n\nAdditional Instructions: {additional_instructions}"
        
        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context from company knowledge base:\n{context}\n\nRequest: {prompt}"}
        ]
        
        # Generate content using OpenAI
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            max_tokens=1500,
            temperature=0.7
        )

        generated_content = response.choices[0].message.content.strip()

        return {
            "success": True,
            "content": generated_content,
            "context_used": context[:500] + "..." if len(context) > 500 else context,
            "tokens_used": response.usage.total_tokens
        }
        
    except Exception as e:
        logger.error(f"Error generating content: {e}")
        return {
            "success": False,
            "error": str(e),
            "content": "",
            "context_used": ""
        }


async def generate_email(
    prompt: str,
    client_id: str,
    sub_client_id: Optional[str] = None,
    recipient_name: Optional[str] = None,
    sender_name: Optional[str] = None
) -> Dict[str, Any]:
    """Generate professional email"""
    return await generate_content(
        prompt=prompt,
        content_type="email",
        client_id=client_id,
        sub_client_id=sub_client_id,
        recipient_name=recipient_name,
        sender_name=sender_name,
        additional_instructions="Write a professional, personalized email that references relevant past work and demonstrates expertise."
    )


async def generate_summary(
    prompt: str,
    client_id: str,
    sub_client_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate executive summary"""
    return await generate_content(
        prompt=prompt,
        content_type="summary",
        client_id=client_id,
        sub_client_id=sub_client_id,
        additional_instructions="Create a comprehensive summary with key insights, metrics, and actionable recommendations."
    )


async def generate_proposal(
    prompt: str,
    client_id: str,
    sub_client_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate project proposal"""
    return await generate_content(
        prompt=prompt,
        content_type="proposal",
        client_id=client_id,
        sub_client_id=sub_client_id,
        additional_instructions="Create a compelling proposal with technical approach, timeline, budget considerations, and references to successful similar projects."
    )


async def generate_scope_of_work(
    prompt: str,
    client_id: str,
    sub_client_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate scope of work document"""
    return await generate_content(
        prompt=prompt,
        content_type="scope_of_work",
        client_id=client_id,
        sub_client_id=sub_client_id,
        additional_instructions="Define clear deliverables, milestones, acceptance criteria, and risk mitigation strategies based on past project experience."
    )


async def generate_action_items(
    prompt: str,
    client_id: str,
    sub_client_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate action items from content"""
    return await generate_content(
        prompt=prompt,
        content_type="action_items",
        client_id=client_id,
        sub_client_id=sub_client_id,
        additional_instructions="Extract specific, actionable tasks with clear priorities, ownership, and realistic deadlines."
    )
