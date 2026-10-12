"""
Axiom AI — FastAPI Main Application
Harvey-like Legal Compliance Platform (100% Free & Local)
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config import settings
from database.db import init_db
from routers import documents, analysis, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.CHROMA_DIR, exist_ok=True)
    print(f"✅ Database initialized")
    print(f"✅ Using Ollama model: {settings.OLLAMA_MODEL}")
    yield
    # Shutdown
    print(f"👋 Shutting down {settings.APP_NAME}")


app = FastAPI(
    title="Axiom AI — Legal Compliance Platform",
    description="AI-powered legal compliance analysis platform (M&A, Contract Review, Regulatory Compliance)",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(documents.router)
app.include_router(analysis.router)
app.include_router(chat.router)


# ─── Health & Status Endpoints ────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "features": ["M&A Due Diligence"],
    }


@app.get("/api/health")
async def health_check():
    """Check system health and Ollama availability."""
    import httpx
    ollama_status = "offline"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                models = [m["name"] for m in resp.json().get("models", [])]
                ollama_status = "online"
                return {
                    "status": "healthy",
                    "ollama": ollama_status,
                    "available_models": models,
                    "configured_model": settings.OLLAMA_MODEL,
                    "embed_model": settings.OLLAMA_EMBED_MODEL,
                }
    except Exception:
        pass

    return {
        "status": "degraded",
        "ollama": ollama_status,
        "message": "Ollama is not running. Start Ollama and pull required models.",
        "instructions": [
            "1. Install Ollama from https://ollama.ai",
            f"2. Run: ollama pull {settings.OLLAMA_MODEL}",
            f"3. Run: ollama pull {settings.OLLAMA_EMBED_MODEL}",
        ]
    }
