"""
Centralized configuration management for Lemur AI
"""

import os
from typing import Optional
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # ============================================================================
    # SERVER CONFIGURATION
    # ============================================================================
    app_name: str = "Lemur AI"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, env="DEBUG")
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    
    # ============================================================================
    # SECURITY
    # ============================================================================
    jwt_secret_key: str = Field(env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_expiration_hours: int = Field(default=24, env="JWT_EXPIRATION_HOURS")
    
    # ============================================================================
    # DATABASE (SUPABASE)
    # ============================================================================
    supabase_url: str = Field(env="SUPABASE_URL")
    supabase_anon_key: str = Field(env="SUPABASE_ANON_KEY")
    supabase_service_key: Optional[str] = Field(default=None, env="SUPABASE_SERVICE_KEY")
    
    # ============================================================================
    # AI/ML SERVICES
    # ============================================================================
    openai_api_key: str = Field(env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4", env="OPENAI_MODEL")
    
    # ============================================================================
    # RECALL AI
    # ============================================================================
    recall_api_key: str = Field(env="RECALL_API_KEY")
    recall_calendar_auth_url: str = Field(env="RECALL_CALENDAR_AUTH_URL")
    
    # ============================================================================
    # GOOGLE SERVICES
    # ============================================================================
    google_client_id: str = Field(env="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(env="GOOGLE_CLIENT_SECRET")
    google_redirect_uri: str = Field(env="GOOGLE_REDIRECT_URI")
    google_redirect_uri_calendar: str = Field(env="GOOGLE_REDIRECT_URI_CALENDAR")
    google_oauth_base_url: str = Field(env="GOOGLE_OAUTH_BASE_URL")
    
    # ============================================================================
    # EMAIL CONFIGURATION
    # ============================================================================
    smtp_server: str = Field(env="SMTP_SERVER")
    smtp_port: int = Field(env="SMTP_PORT")
    smtp_username: str = Field(env="SMTP_USERNAME")
    smtp_password: str = Field(env="SMTP_PASSWORD")
    from_email: str = Field(env="FROM_EMAIL")
    from_name: str = Field(env="FROM_NAME")
    
    # ============================================================================
    # FILE HANDLING
    # ============================================================================
    max_file_size: int = Field(default=10485760, env="MAX_FILE_SIZE")  # 10MB
    upload_dir: str = Field(default="./data/uploads", env="UPLOAD_DIR")
    allowed_file_types: list = [".pdf", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".bmp", ".tiff"]
    
    # ============================================================================
    # VECTOR DATABASE
    # ============================================================================
    chroma_db_path: str = Field(default="./data/chroma_db", env="CHROMA_DB_PATH")
    embedding_model: str = Field(default="text-embedding-ada-002", env="EMBEDDING_MODEL")
    
    # ============================================================================
    # CORS
    # ============================================================================
    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        env="ALLOWED_ORIGINS"
    )

    def get_allowed_origins_list(self) -> list:
        """Parse allowed origins string into list"""
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(",")]
        return self.allowed_origins

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings


def is_development() -> bool:
    """Check if running in development mode"""
    return settings.debug


def is_production() -> bool:
    """Check if running in production mode"""
    return not settings.debug


def get_database_url() -> str:
    """Get database connection URL"""
    return settings.supabase_url


def get_upload_path() -> str:
    """Get upload directory path"""
    os.makedirs(settings.upload_dir, exist_ok=True)
    return settings.upload_dir


def get_chroma_path() -> str:
    """Get ChromaDB path"""
    os.makedirs(settings.chroma_db_path, exist_ok=True)
    return settings.chroma_db_path
