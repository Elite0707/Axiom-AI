from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Document Schemas ─────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    filename: str
    original_name: str
    file_type: str
    module: str
    status: str
    page_count: int
    chunk_count: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ─── M&A Analysis Schemas ─────────────────────────────────────────────────────

class MAParty(BaseModel):
    name: str
    role: str  # Acquirer / Target / Advisor / etc.

class RiskFlag(BaseModel):
    clause: str
    risk_level: str  # HIGH / MEDIUM / LOW
    description: str
    page_reference: Optional[str] = None

class MAAnalysisResult(BaseModel):
    # Core extraction
    deal_title: Optional[str] = None
    deal_type: Optional[str] = None           # Share Purchase / Asset Purchase / Merger
    deal_value: Optional[str] = None
    governing_law: Optional[str] = None
    jurisdiction: Optional[str] = None
    signing_date: Optional[str] = None
    closing_date: Optional[str] = None

    # Parties
    parties: List[MAParty] = []

    # Key clauses
    conditions_precedent: List[str] = []
    representations_warranties: List[str] = []
    indemnification_provisions: List[str] = []
    non_compete_clauses: List[str] = []
    mac_clauses: List[str] = []              # Material Adverse Change
    termination_rights: List[str] = []

    # Risk Assessment
    risk_flags: List[RiskFlag] = []
    overall_risk_level: str = "UNKNOWN"      # HIGH / MEDIUM / LOW

    # Summary
    executive_summary: str = ""
    key_recommendations: List[str] = []


class AnalysisOut(BaseModel):
    id: str
    document_id: str
    document_name: str
    module: str
    status: str
    result: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Chat Schemas ─────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str       # user | assistant
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    document_id: str
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: List[str] = []
    messages: List[ChatMessage] = []
