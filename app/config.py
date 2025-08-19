from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseModel):
    OLLAMA_HOST: str = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    CHAT_MODEL: str = os.getenv("CHAT_MODEL", "mistral:latest")
    EMBED_MODEL: str = os.getenv("EMBED_MODEL", "nomic-embed-text")

    RAG_DIR: str = os.getenv("RAG_DIR", "./rag_store")
    DOCS_COLLECTION: str = os.getenv("DOCS_COLLECTION", "docs")
    MEM_COLLECTION: str = os.getenv("MEM_COLLECTION", "memories")

    TOP_K: int = int(os.getenv("TOP_K", "4"))
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1200"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

settings = Settings()