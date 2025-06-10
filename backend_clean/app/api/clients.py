"""
Client management API routes
Handles client organizations and sub-clients (Centralized Brain)
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from app.core.database import db_manager
from app.models.client import Client, SubClient
from app.schemas.client import (
    ClientCreateRequest, ClientResponse,
    SubClientCreateRequest, SubClientResponse
)
from app.core.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=ClientResponse)
async def create_client(
    request: ClientCreateRequest,
    current_user_id: str = Depends(get_current_user)
):
    """
    Create a new client organization (Centralized Brain)
    
    Each client represents a company's centralized knowledge base
    where all documents, meetings, and AI-generated content are stored.
    """
    try:
        client = Client(
            name=request.name,
            description=request.description,
            user_id=current_user_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        result = await db_manager.create_client(client)
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to create client"
            )
        
        return ClientResponse(
            id=result["id"],
            name=result["name"],
            description=result.get("description"),
            user_id=result["user_id"],
            created_at=result["created_at"],
            updated_at=result["updated_at"],
            is_active=result["is_active"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create client: {str(e)}"
        )


@router.get("/", response_model=List[ClientResponse])
async def get_clients(current_user_id: str = Depends(get_current_user)):
    """
    Get all client organizations for the current user
    
    Returns all centralized brains (client organizations) that the user owns.
    """
    try:
        clients = await db_manager.get_clients_by_user(current_user_id)
        return [
            ClientResponse(
                id=client["id"],
                name=client["name"],
                description=client.get("description"),
                user_id=client["user_id"],
                created_at=client["created_at"],
                updated_at=client["updated_at"],
                is_active=client["is_active"]
            )
            for client in clients
        ]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get clients: {str(e)}"
        )


@router.post("/{client_id}/sub-clients", response_model=SubClientResponse)
async def create_sub_client(
    client_id: str,
    request: SubClientCreateRequest,
    current_user_id: str = Depends(get_current_user)
):
    """
    Create a sub-client (project/department within organization)
    
    Sub-clients allow for project-specific or department-specific
    organization within a client's centralized brain.
    """
    # Verify user owns the parent client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to create sub-clients for this client"
        )
    
    try:
        sub_client = SubClient(
            name=request.name,
            description=request.description,
            client_id=client_id,
            contact_email=request.contact_email,
            contact_name=request.contact_name,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        result = await db_manager.create_sub_client(sub_client)
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to create sub-client"
            )
        
        return SubClientResponse(
            id=result["id"],
            name=result["name"],
            description=result.get("description"),
            client_id=result["client_id"],
            contact_email=result.get("contact_email"),
            contact_name=result.get("contact_name"),
            created_at=result["created_at"],
            updated_at=result["updated_at"],
            is_active=result["is_active"]
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create sub-client: {str(e)}"
        )


@router.get("/{client_id}/sub-clients", response_model=List[SubClientResponse])
async def get_sub_clients(
    client_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """
    Get all sub-clients for a client organization
    
    Returns all projects/departments within a client's centralized brain.
    """
    # Verify user owns the parent client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to access sub-clients for this client"
        )
    
    try:
        sub_clients = await db_manager.get_sub_clients_by_client(client_id)
        return [
            SubClientResponse(
                id=sub_client["id"],
                name=sub_client["name"],
                description=sub_client.get("description"),
                client_id=sub_client["client_id"],
                contact_email=sub_client.get("contact_email"),
                contact_name=sub_client.get("contact_name"),
                created_at=sub_client["created_at"],
                updated_at=sub_client["updated_at"],
                is_active=sub_client["is_active"]
            )
            for sub_client in sub_clients
        ]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get sub-clients: {str(e)}"
        )


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Get a specific client by ID"""
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    client = next((c for c in clients if c["id"] == client_id), None)

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found or you don't have permission to access it"
        )

    return ClientResponse(
        id=client["id"],
        name=client["name"],
        description=client["description"],
        user_id=client["user_id"],
        created_at=client["created_at"],
        updated_at=client["updated_at"],
        is_active=client["is_active"]
    )


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    request: ClientCreateRequest,
    current_user_id: str = Depends(get_current_user)
):
    """Update a client"""
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to update this client"
        )

    try:
        updated_client = await db_manager.update_client(
            client_id=client_id,
            name=request.name,
            description=request.description
        )

        return ClientResponse(
            id=updated_client["id"],
            name=updated_client["name"],
            description=updated_client["description"],
            user_id=updated_client["user_id"],
            created_at=updated_client["created_at"],
            updated_at=updated_client["updated_at"],
            is_active=updated_client["is_active"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update client: {str(e)}"
        )


@router.delete("/{client_id}")
async def delete_client(
    client_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Delete a client"""
    # Verify user owns the client
    clients = await db_manager.get_clients_by_user(current_user_id)
    if not any(client["id"] == client_id for client in clients):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to delete this client"
        )

    try:
        await db_manager.delete_client(client_id)
        return {"message": "Client deleted successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete client: {str(e)}"
        )
