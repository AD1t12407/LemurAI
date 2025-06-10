"""
Vector store operations using ChromaDB
Handles document embeddings and semantic search
"""

import logging
import uuid
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from openai import OpenAI
from app.utils.config import get_settings, get_chroma_path

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize OpenAI for embeddings
client = OpenAI(api_key=settings.openai_api_key)

# Global ChromaDB client
chroma_client = None


def get_chroma_client():
    """Get or create ChromaDB client"""
    global chroma_client
    
    if chroma_client is None:
        try:
            chroma_path = get_chroma_path()
            chroma_client = chromadb.PersistentClient(
                path=chroma_path,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            logger.info(f"ChromaDB client initialized at {chroma_path}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise
    
    return chroma_client


def get_collection_name(client_id: str, sub_client_id: Optional[str] = None) -> str:
    """Generate collection name for client/sub-client"""
    if sub_client_id:
        return f"client_{client_id}_sub_{sub_client_id}"
    return f"client_{client_id}"


def create_embeddings(texts: List[str]) -> List[List[float]]:
    """Create embeddings for texts using OpenAI"""
    try:
        response = client.embeddings.create(
            model=settings.embedding_model,
            input=texts
        )
        return [embedding.embedding for embedding in response.data]
    except Exception as e:
        logger.error(f"Error creating embeddings: {e}")
        raise


def store_document_chunks(
    client_id: str,
    file_id: str,
    filename: str,
    text_chunks: List[str],
    sub_client_id: Optional[str] = None
) -> int:
    """
    Store document chunks in vector database
    
    This builds the "Centralized Brain" by storing document embeddings
    that can be searched semantically for AI content generation.
    """
    try:
        client = get_chroma_client()
        collection_name = get_collection_name(client_id, sub_client_id)
        
        # Get or create collection
        try:
            collection = client.get_collection(collection_name)
        except:
            collection = client.create_collection(
                name=collection_name,
                metadata={"client_id": client_id, "sub_client_id": sub_client_id}
            )
        
        # Create embeddings for chunks
        embeddings = create_embeddings(text_chunks)
        
        # Generate IDs for chunks
        chunk_ids = [f"{file_id}_chunk_{i}" for i in range(len(text_chunks))]
        
        # Create metadata for each chunk
        metadatas = [
            {
                "file_id": file_id,
                "filename": filename,
                "chunk_index": i,
                "client_id": client_id,
                "sub_client_id": sub_client_id,
                "text_length": len(chunk)
            }
            for i, chunk in enumerate(text_chunks)
        ]
        
        # Store in ChromaDB
        collection.add(
            embeddings=embeddings,
            documents=text_chunks,
            metadatas=metadatas,
            ids=chunk_ids
        )
        
        logger.info(f"Stored {len(text_chunks)} chunks for file {filename}")
        return len(text_chunks)
        
    except Exception as e:
        logger.error(f"Error storing document chunks: {e}")
        raise


def search_knowledge_base(
    query: str,
    client_id: str,
    sub_client_id: Optional[str] = None,
    n_results: int = 5
) -> List[Dict[str, Any]]:
    """
    Search the knowledge base for relevant information
    
    This is the core search function for the "Centralized Brain" -
    it finds relevant context from all stored documents.
    """
    try:
        client = get_chroma_client()
        collection_name = get_collection_name(client_id, sub_client_id)
        
        try:
            collection = client.get_collection(collection_name)
        except:
            logger.warning(f"Collection {collection_name} not found")
            return []
        
        # Create embedding for query
        query_embedding = create_embeddings([query])[0]
        
        # Search collection
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        
        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                formatted_results.append({
                    "text": doc,
                    "metadata": results["metadatas"][0][i],
                    "score": 1 - results["distances"][0][i]  # Convert distance to similarity score
                })
        
        logger.info(f"Found {len(formatted_results)} results for query: {query[:50]}...")
        return formatted_results
        
    except Exception as e:
        logger.error(f"Error searching knowledge base: {e}")
        return []


def get_client_knowledge_stats(client_id: str, sub_client_id: Optional[str] = None) -> Dict[str, Any]:
    """Get statistics about stored knowledge for a client"""
    try:
        client = get_chroma_client()
        collection_name = get_collection_name(client_id, sub_client_id)
        
        try:
            collection = client.get_collection(collection_name)
            count = collection.count()
            
            return {
                "total_chunks": count,
                "collection_name": collection_name,
                "has_knowledge": count > 0
            }
        except:
            return {
                "total_chunks": 0,
                "collection_name": collection_name,
                "has_knowledge": False
            }
            
    except Exception as e:
        logger.error(f"Error getting knowledge stats: {e}")
        return {
            "total_chunks": 0,
            "collection_name": "",
            "has_knowledge": False
        }


def delete_file_chunks(file_id: str, client_id: str, sub_client_id: Optional[str] = None):
    """Delete all chunks for a specific file"""
    try:
        client = get_chroma_client()
        collection_name = get_collection_name(client_id, sub_client_id)
        
        try:
            collection = client.get_collection(collection_name)
            
            # Get all chunk IDs for this file
            results = collection.get(
                where={"file_id": file_id},
                include=["metadatas"]
            )
            
            if results["ids"]:
                collection.delete(ids=results["ids"])
                logger.info(f"Deleted {len(results['ids'])} chunks for file {file_id}")
                
        except Exception as e:
            logger.warning(f"Could not delete chunks for file {file_id}: {e}")
            
    except Exception as e:
        logger.error(f"Error deleting file chunks: {e}")
