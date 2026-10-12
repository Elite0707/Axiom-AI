"""
Chat / RAG Q&A Endpoints
"""
import asyncio
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.db import get_db, Document, ChatSession
from models.schemas import ChatRequest, ChatResponse, ChatMessage
from services.rag_service import rag_answer

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat_with_document(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """Chat with an uploaded document using RAG."""
    # Verify document is ready
    result = await db.execute(select(Document).where(Document.id == request.document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.status != "ready":
        raise HTTPException(status_code=400, detail=f"Document is not ready yet (status: {doc.status})")

    # Get or create chat session
    session = None
    if request.session_id:
        res = await db.execute(select(ChatSession).where(ChatSession.id == request.session_id))
        session = res.scalar_one_or_none()

    if not session:
        session = ChatSession(
            id=str(uuid.uuid4()),
            document_id=request.document_id,
            messages=[]
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

    messages = list(session.messages or [])

    # Run RAG in thread pool (blocking LLM calls)
    answer, sources = await asyncio.get_event_loop().run_in_executor(
        None,
        rag_answer,
        request.document_id,
        request.message,
        messages
    )

    # Append to session history
    user_msg = {
        "role": "user",
        "content": request.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    assistant_msg = {
        "role": "assistant",
        "content": answer,
        "timestamp": datetime.utcnow().isoformat()
    }
    messages.append(user_msg)
    messages.append(assistant_msg)
    session.messages = messages
    await db.commit()

    return ChatResponse(
        session_id=session.id,
        answer=answer,
        sources=sources,
        messages=[ChatMessage(**m) for m in messages]
    )


@router.get("/{session_id}", response_model=ChatResponse)
async def get_chat_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get chat history for a session."""
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    messages = session.messages or []
    return ChatResponse(
        session_id=session.id,
        answer="",
        sources=[],
        messages=[ChatMessage(**m) for m in messages]
    )


@router.delete("/{session_id}")
async def clear_chat(session_id: str, db: AsyncSession = Depends(get_db)):
    """Clear chat history for a session."""
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    session.messages = []
    await db.commit()
    return {"message": "Chat history cleared"}
