"""
Document Upload & Management Endpoints
"""
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio

from database.db import get_db, Document
from models.schemas import DocumentOut
from services.document_service import save_upload, extract_text, chunk_legal_text
from services.rag_service import index_document_chunks
from config import settings

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_TYPES = {".pdf", ".docx", ".doc"}


@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    module: str = Form(default="ma"),
    db: AsyncSession = Depends(get_db)
):
    """Upload and process a legal document for RAG indexing."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: PDF, DOCX"
        )

    # Read file content
    file_bytes = await file.read()
    if len(file_bytes) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")

    # Save to disk
    file_id, saved_path = save_upload(file_bytes, file.filename)

    # Create DB record (status = processing)
    doc = Document(
        id=file_id,
        filename=os.path.basename(saved_path),
        original_name=file.filename,
        file_type=ext,
        module=module,
        status="processing",
    )
    db.add(doc)
    await db.commit()

    # Process in background (non-blocking)
    asyncio.create_task(_process_document(file_id, saved_path, file.filename, module, db))

    await db.refresh(doc)
    return doc


async def _process_document(file_id: str, file_path: str, original_name: str, module: str, db: AsyncSession):
    """Background task: extract text, chunk, and index into ChromaDB."""
    try:
        # Extract text
        text, page_count = extract_text(file_path)

        # Chunk
        chunks = chunk_legal_text(text)

        # Index into ChromaDB (run in thread to avoid blocking async loop)
        chunk_count = await asyncio.get_event_loop().run_in_executor(
            None,
            index_document_chunks,
            file_id, chunks, original_name
        )

        # Update DB record
        async with db.begin():
            result = await db.execute(select(Document).where(Document.id == file_id))
            doc = result.scalar_one_or_none()
            if doc:
                doc.status = "ready"
                doc.page_count = page_count
                doc.chunk_count = chunk_count

    except Exception as e:
        # Mark as error
        try:
            async with db.begin():
                result = await db.execute(select(Document).where(Document.id == file_id))
                doc = result.scalar_one_or_none()
                if doc:
                    doc.status = "error"
        except Exception:
            pass
        print(f"[ERROR] Document processing failed for {file_id}: {e}")


@router.get("/", response_model=list[DocumentOut])
async def list_documents(module: str = "ma", db: AsyncSession = Depends(get_db)):
    """List all uploaded documents."""
    result = await db.execute(
        select(Document).where(Document.module == module).order_by(Document.uploaded_at.desc())
    )
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single document by ID."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}")
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document and its vector index."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from ChromaDB
    try:
        from services.rag_service import get_chroma_client
        client = get_chroma_client()
        collection_name = f"doc_{document_id.replace('-', '_')}"
        client.delete_collection(collection_name)
    except Exception:
        pass

    # Delete file from disk
    try:
        file_path = os.path.join(settings.UPLOAD_DIR, doc.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted successfully"}
