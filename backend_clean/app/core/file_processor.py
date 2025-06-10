"""
File processing and text extraction
"""

import logging
import os
import uuid
from typing import Dict, Any, List, Optional
from pathlib import Path
import PyPDF2
import docx
from PIL import Image
import pytesseract
from app.utils.config import get_settings, get_upload_path
from app.core.vector_store import store_document_chunks

logger = logging.getLogger(__name__)
settings = get_settings()


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        return ""


def extract_text_from_image(file_path: str) -> str:
    """Extract text from image using OCR"""
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        return ""


def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except Exception as e:
        logger.error(f"Error reading text file: {e}")
        return ""


def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from file based on type"""
    extractors = {
        '.pdf': extract_text_from_pdf,
        '.docx': extract_text_from_docx,
        '.txt': extract_text_from_txt,
        '.jpg': extract_text_from_image,
        '.jpeg': extract_text_from_image,
        '.png': extract_text_from_image,
        '.bmp': extract_text_from_image,
        '.tiff': extract_text_from_image
    }
    
    extractor = extractors.get(file_type.lower())
    if extractor:
        return extractor(file_path)
    else:
        logger.warning(f"No extractor available for file type: {file_type}")
        return ""


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks for better context preservation
    
    This is crucial for the "Centralized Brain" - proper chunking ensures
    that related information stays together for better AI retrieval.
    """
    if not text or len(text) < chunk_size:
        return [text] if text else []
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at sentence boundaries
        if end < len(text):
            # Look for sentence endings within the last 100 characters
            sentence_end = text.rfind('.', start + chunk_size - 100, end)
            if sentence_end > start:
                end = sentence_end + 1
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # Move start position with overlap
        start = end - overlap
        if start >= len(text):
            break
    
    return chunks


def save_uploaded_file(file_content: bytes, filename: str, client_id: str) -> str:
    """Save uploaded file to storage"""
    try:
        upload_dir = get_upload_path()
        client_dir = os.path.join(upload_dir, client_id)
        os.makedirs(client_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(filename).suffix
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(client_dir, unique_filename)
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        logger.info(f"File saved: {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise


async def process_and_store_file(
    file_content: bytes,
    filename: str,
    client_id: str,
    file_id: str,
    sub_client_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process uploaded file and store in knowledge base
    
    This is the core function that builds the "Centralized Brain":
    1. Saves the file
    2. Extracts text content
    3. Chunks the text appropriately
    4. Creates embeddings and stores in vector database
    """
    try:
        # Save file to storage
        file_path = save_uploaded_file(file_content, filename, client_id)
        
        # Extract text based on file type
        file_extension = Path(filename).suffix.lower()
        extracted_text = extract_text_from_file(file_path, file_extension)
        
        if not extracted_text:
            return {
                "success": False,
                "error": "No text could be extracted from file",
                "extracted_text": "",
                "chunks_stored": 0
            }
        
        # Chunk the text for better retrieval
        text_chunks = chunk_text(extracted_text)
        
        if not text_chunks:
            return {
                "success": False,
                "error": "No text chunks created",
                "extracted_text": extracted_text,
                "chunks_stored": 0
            }
        
        # Store chunks in vector database
        chunks_stored = store_document_chunks(
            client_id=client_id,
            file_id=file_id,
            filename=filename,
            text_chunks=text_chunks,
            sub_client_id=sub_client_id
        )
        
        logger.info(f"Successfully processed file {filename}: {len(extracted_text)} chars, {chunks_stored} chunks")
        
        return {
            "success": True,
            "extracted_text": extracted_text,
            "chunks_stored": chunks_stored,
            "file_path": file_path,
            "text_length": len(extracted_text)
        }
        
    except Exception as e:
        logger.error(f"Error processing file {filename}: {e}")
        return {
            "success": False,
            "error": str(e),
            "extracted_text": "",
            "chunks_stored": 0
        }


def get_supported_file_types() -> List[str]:
    """Get list of supported file types"""
    return settings.allowed_file_types


def validate_file_type(filename: str) -> bool:
    """Validate if file type is supported"""
    file_extension = Path(filename).suffix.lower()
    return file_extension in settings.allowed_file_types


def validate_file_size(file_size: int) -> bool:
    """Validate if file size is within limits"""
    return file_size <= settings.max_file_size
