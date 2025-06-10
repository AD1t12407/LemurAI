"""
File upload and knowledge base API routes
"""

import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.core.auth import get_current_user
from app.core.database import db_manager
from app.core.file_processor import process_and_store_file, validate_file_type, validate_file_size
from app.core.vector_store import search_knowledge_base, get_client_knowledge_stats
from app.models.file import File as FileModel
from app.schemas.file import FileResponse, KnowledgeSearchRequest, KnowledgeSearchResponse

router = APIRouter()


@router.post("/upload", response_model=FileResponse)
async def upload_file(
    client_id: str = Form(...),
    sub_client_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user)
):
    """
    Upload and process file for knowledge base
    
    This builds the "Centralized Brain" by:
    1. Validating and storing the file
    2. Extracting text content
    3. Creating embeddings and storing in vector database
    """
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to upload files for this client"
        )
    
    # Validate file
    if not validate_file_type(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Supported types: {', '.join(['.pdf', '.docx', '.txt', '.jpg', '.png'])}"
        )
    
    file_content = await file.read()
    if not validate_file_size(len(file_content)):
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {10} MB"
        )
    
    try:
        # Create file record
        file_id = str(uuid.uuid4())
        file_model = FileModel(
            id=file_id,
            filename=f"{file_id}_{file.filename}",
            original_filename=file.filename,
            file_type=file.filename.split('.')[-1] if '.' in file.filename else '',
            file_size=len(file_content),
            storage_path=f"uploads/{client_id}/{file_id}_{file.filename}",
            client_id=client_id,
            sub_client_id=sub_client_id,
            user_id=current_user_id,
            processed=False,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Process file and extract text
        processing_result = await process_and_store_file(
            file_content=file_content,
            filename=file.filename,
            client_id=client_id,
            file_id=file_id,
            sub_client_id=sub_client_id
        )
        
        if not processing_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process file: {processing_result.get('error', 'Unknown error')}"
            )
        
        # Update file model with processing results
        file_model.processed = True
        file_model.extracted_text = processing_result["extracted_text"]
        file_model.chunks_stored = processing_result["chunks_stored"]
        
        # Save file record to database
        result = await db_manager.create_file_record(file_model)
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to create file record"
            )
        
        return FileResponse(
            id=result["id"],
            filename=result["filename"],
            original_filename=result["original_filename"],
            file_type=result["file_type"],
            file_size=result["file_size"],
            client_id=result["client_id"],
            sub_client_id=result.get("sub_client_id"),
            processed=result["processed"],
            extracted_text=result.get("extracted_text", "")[:500] + "..." if result.get("extracted_text") and len(result.get("extracted_text", "")) > 500 else result.get("extracted_text", ""),
            chunks_stored=processing_result["chunks_stored"],
            created_at=result["created_at"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload and process file: {str(e)}"
        )


@router.post("/search", response_model=KnowledgeSearchResponse)
async def search_knowledge(
    request: KnowledgeSearchRequest,
    current_user_id: str = Depends(get_current_user)
):
    """
    Search the knowledge base for relevant information
    
    This is the core search function for the "Centralized Brain" -
    it finds relevant context from all stored documents.
    """
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == request.client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to search this client's knowledge base"
        )
    
    try:
        results = search_knowledge_base(
            query=request.query,
            client_id=request.client_id,
            sub_client_id=request.sub_client_id,
            n_results=request.n_results
        )
        
        return KnowledgeSearchResponse(
            results=results,
            query=request.query,
            total_results=len(results)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search knowledge base: {str(e)}"
        )


@router.get("/knowledge-stats/{client_id}")
async def get_knowledge_stats(
    client_id: str,
    sub_client_id: Optional[str] = None,
    current_user_id: str = Depends(get_current_user)
):
    """Get statistics about stored knowledge for a client"""
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access this client's knowledge stats"
        )
    
    try:
        stats = get_client_knowledge_stats(client_id, sub_client_id)
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get knowledge stats: {str(e)}"
        )
