from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Axiom AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Ollama (local, free)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1"  # or "mistral" — both free
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"  # free local embeddings

    # Paths
    UPLOAD_DIR: str = "uploads"
    CHROMA_DIR: str = "chroma_db"
    DB_URL: str = "sqlite+aiosqlite:///./axiom.db"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
