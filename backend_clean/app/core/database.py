"""
Clean database operations for Lemur AI
Consolidates all database functionality without duplication
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from supabase import create_client, Client
from app.utils.config import get_settings
from app.models.user import User
from app.models.client import Client as ClientModel, SubClient
from app.models.file import File
from app.models.output import Output

logger = logging.getLogger(__name__)
settings = get_settings()

# Global Supabase client
supabase_client: Optional[Client] = None


class DatabaseManager:
    """Centralized database operations manager"""
    
    def __init__(self):
        self.client = get_supabase_client()
    
    # ============================================================================
    # USER OPERATIONS
    # ============================================================================
    
    async def create_user(self, user: User) -> Optional[Dict[str, Any]]:
        """Create a new user"""
        try:
            user_data = {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat(),
                "is_active": user.is_active
            }
            
            result = self.client.table("users").insert(user_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            result = self.client.table("users").select("*").eq("email", email).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            result = self.client.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    # ============================================================================
    # CLIENT OPERATIONS
    # ============================================================================
    
    async def create_client(self, client: ClientModel) -> Optional[Dict[str, Any]]:
        """Create a new client"""
        try:
            client_data = {
                "name": client.name,
                "description": client.description,
                "user_id": client.user_id,
                "created_at": client.created_at.isoformat(),
                "updated_at": client.updated_at.isoformat(),
                "is_active": client.is_active
            }
            
            result = self.client.table("clients").insert(client_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating client: {e}")
            return None
    
    async def get_clients_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all clients for a user"""
        try:
            result = self.client.table("clients").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting clients: {e}")
            return []
    
    async def create_sub_client(self, sub_client: SubClient) -> Optional[Dict[str, Any]]:
        """Create a new sub-client"""
        try:
            sub_client_data = {
                "name": sub_client.name,
                "description": sub_client.description,
                "client_id": sub_client.client_id,
                "contact_email": sub_client.contact_email,
                "contact_name": sub_client.contact_name,
                "created_at": sub_client.created_at.isoformat(),
                "updated_at": sub_client.updated_at.isoformat(),
                "is_active": sub_client.is_active
            }
            
            result = self.client.table("sub_clients").insert(sub_client_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating sub-client: {e}")
            return None
    
    async def get_sub_clients_by_client(self, client_id: str) -> List[Dict[str, Any]]:
        """Get all sub-clients for a client"""
        try:
            result = self.client.table("sub_clients").select("*").eq("client_id", client_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting sub-clients: {e}")
            return []
    
    # ============================================================================
    # FILE OPERATIONS
    # ============================================================================
    
    async def create_file_record(self, file: File) -> Optional[Dict[str, Any]]:
        """Create a file record"""
        try:
            file_data = {
                "filename": file.filename,
                "original_filename": file.original_filename,
                "file_type": file.file_type,
                "file_size": file.file_size,
                "storage_path": file.storage_path,
                "client_id": file.client_id,
                "sub_client_id": file.sub_client_id,
                "user_id": file.user_id,
                "processed": file.processed,
                "extracted_text": file.extracted_text,
                "created_at": file.created_at.isoformat(),
                "updated_at": file.updated_at.isoformat()
            }
            # Remove None values
            file_data = {k: v for k, v in file_data.items() if v is not None}
            
            result = self.client.table("files").insert(file_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating file record: {e}")
            return None
    
    async def get_files_by_client(self, client_id: str, sub_client_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get files for a client/sub-client"""
        try:
            query = self.client.table("files").select("*").eq("client_id", client_id)
            if sub_client_id:
                query = query.eq("sub_client_id", sub_client_id)
            
            result = query.execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting files: {e}")
            return []
    
    # ============================================================================
    # OUTPUT OPERATIONS
    # ============================================================================
    
    async def create_output(self, output: Output) -> Optional[Dict[str, Any]]:
        """Create an LLM output record"""
        try:
            output_data = {
                "title": output.title,
                "content": output.content,
                "output_type": output.output_type,
                "prompt": output.prompt,
                "client_id": output.client_id,
                "sub_client_id": output.sub_client_id,
                "user_id": output.user_id,
                "file_id": output.file_id,
                "meeting_id": output.meeting_id,
                "created_at": output.created_at.isoformat(),
                "updated_at": output.updated_at.isoformat()
            }
            # Remove None values
            output_data = {k: v for k, v in output_data.items() if v is not None}
            
            result = self.client.table("outputs").insert(output_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating output: {e}")
            return None
    
    async def get_outputs_by_client(self, client_id: str, sub_client_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get outputs for a client/sub-client"""
        try:
            query = self.client.table("outputs").select("*").eq("client_id", client_id)
            if sub_client_id:
                query = query.eq("sub_client_id", sub_client_id)

            result = query.execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting outputs: {e}")
            return []

    async def get_all_outputs(self) -> List[Dict[str, Any]]:
        """Get all outputs (for debug purposes)"""
        try:
            result = self.client.table("outputs").select("*").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting all outputs: {e}")
            return []


def get_supabase_client() -> Client:
    """Get or create Supabase client"""
    global supabase_client

    if supabase_client is None:
        try:
            # Use service key if available (bypasses RLS), otherwise use anon key
            key = settings.supabase_service_key or settings.supabase_anon_key

            # Create client without options to avoid compatibility issues
            supabase_client = create_client(settings.supabase_url, key)
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise

    return supabase_client


def init_database() -> bool:
    """Initialize database connection"""
    try:
        client = get_supabase_client()
        # Test connection
        result = client.table("users").select("id").limit(1).execute()
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False


# Global database manager instance
db_manager = DatabaseManager()
