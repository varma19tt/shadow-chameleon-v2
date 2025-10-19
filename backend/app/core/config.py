import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

# Simple configuration without Pydantic
class Config:
    """Application configuration"""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Shadow-Chameleon"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # PostgreSQL Configuration
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "sc")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "scpass")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "shadow")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "postgres")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    
    @property
    def POSTGRES_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Neo4j Configuration
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "neo4jpass")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # Scanning Configuration
    MAX_SCAN_DURATION: int = int(os.getenv("MAX_SCAN_DURATION", "3600"))
    NMAP_TIMEOUT: int = int(os.getenv("NMAP_TIMEOUT", "300"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

# Global config instance
settings = Config()

# Backward compatibility exports
POSTGRES_URI = settings.POSTGRES_URI
NEO4J_URI = settings.NEO4J_URI
NEO4J_USER = settings.NEO4J_USER
NEO4J_PASSWORD = settings.NEO4J_PASSWORD
