"""
M&A Analysis Endpoints
"""
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.db import get_db, Document, Analysis
from models.schemas import AnalysisOut
from services.analysis_service import run_ma_analysis

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/ma/{document_id}", response_model=AnalysisOut)
async def start_ma_analysis(
    document_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Start M&A due diligence analysis on an uploaded document."""
    # Verify document exists and is ready
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.status == "processing":
        raise HTTPException(status_code=400, detail="Document is still being processed. Please wait.")
    if doc.status == "error":
        raise HTTPException(status_code=400, detail="Document processing failed. Please re-upload.")

    # Create analysis record
    analysis = Analysis(
        document_id=document_id,
        document_name=doc.original_name,
        module="ma",
        status="running",
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    # Run analysis in background
    background_tasks.add_task(_run_analysis_bg, analysis.id, document_id, doc.original_name)

    return analysis


async def _run_analysis_bg(analysis_id: str, document_id: str, document_name: str):
    """Background task to run M&A analysis."""
    from database.db import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        try:
            # Run analysis (blocking LLM calls in thread pool)
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                run_ma_analysis,
                document_id,
                document_name
            )

            # Update analysis record
            res = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
            analysis = res.scalar_one_or_none()
            if analysis:
                analysis.status = "done"
                analysis.result = result
                analysis.completed_at = datetime.utcnow()
                await db.commit()

        except Exception as e:
            print(f"[ERROR] Analysis failed for {analysis_id}: {e}")
            res = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
            analysis = res.scalar_one_or_none()
            if analysis:
                analysis.status = "error"
                analysis.result = {"error": str(e)}
                await db.commit()


@router.get("/ma/{analysis_id}", response_model=AnalysisOut)
async def get_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    """Get analysis result by ID (poll this until status = 'done')."""
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/ma/document/{document_id}", response_model=list[AnalysisOut])
async def get_analyses_for_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Get all analyses for a specific document."""
    result = await db.execute(
        select(Analysis)
        .where(Analysis.document_id == document_id)
        .order_by(Analysis.created_at.desc())
    )
    return result.scalars().all()
