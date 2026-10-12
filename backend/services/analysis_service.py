"""
M&A Analysis Service
- Orchestrates multi-step agentic analysis of M&A documents
- Uses structured extraction prompts to pull key deal terms
- Generates risk flags with HIGH/MEDIUM/LOW classification
- Produces executive summary and recommendations
"""
import json
import re
from typing import Dict, Any

from services.rag_service import retrieve_relevant_chunks, get_llm
from models.schemas import MAAnalysisResult, RiskFlag, MAParty


# ─── Unified Fast Analysis Prompt ──────────────────────────────────────────

UNIFIED_ANALYSIS_PROMPT = """You are an expert M&A legal analyst. Analyze these contract excerpts and perform an M&A due diligence review.

DOCUMENT EXCERPTS:
{context}

Respond ONLY with a valid JSON object matching this schema (no markdown, no extra commentary):
{{
  "deal_title": "Title/name of deal or agreement",
  "deal_type": "Share Purchase | Asset Purchase | Merger | Other",
  "deal_value": "Deal consideration amount with currency",
  "governing_law": "Governing law/jurisdiction",
  "jurisdiction": "Country or state",
  "signing_date": "Signing date",
  "closing_date": "Closing date",
  "parties": [
    {{"name": "Party name", "role": "Acquirer | Target | Seller | Advisor"}}
  ],
  "conditions_precedent": ["Key condition 1", "Key condition 2"],
  "representations_warranties": ["Key rep 1", "Key rep 2"],
  "indemnification_provisions": ["Indemnity term 1", "Indemnity term 2"],
  "non_compete_clauses": ["Non-compete term 1"],
  "mac_clauses": ["MAC details"],
  "termination_rights": ["Termination term 1"],
  "risk_flags": [
    {{
      "clause": "Problematic clause name",
      "risk_level": "HIGH | MEDIUM | LOW",
      "description": "Concise explanation of the legal risk",
      "page_reference": "Section or Clause number"
    }}
  ],
  "overall_risk_level": "HIGH | MEDIUM | LOW",
  "executive_summary": "Concise 2-paragraph executive summary highlighting deal terms and main risks.",
  "key_recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ]
}}

JSON Response:"""


# ─── Analysis Orchestrator ────────────────────────────────────────────────────

def _safe_parse_json(text: str) -> Dict:
    """Robustly extract JSON from LLM output even if surrounded by text."""
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Extract block between first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass

    return {}


def _get_targeted_context(document_id: str) -> str:
    """Retrieve the most critical sections for M&A due diligence efficiently."""
    queries = [
        "parties agreement purchase price consideration",
        "warranties indemnification cap liability risk",
        "material adverse change MAC termination rights non-compete",
    ]
    seen = set()
    all_chunks = []
    for query in queries:
        chunks = retrieve_relevant_chunks(document_id, query, top_k=3)
        for chunk, score in chunks:
            if chunk not in seen and score > 0.15:
                seen.add(chunk)
                all_chunks.append(chunk)

    return "\n\n---\n\n".join(all_chunks[:8])


def run_ma_analysis(document_id: str, document_name: str) -> Dict[str, Any]:
    """
    Unified Single-Pass Analysis:
    Runs extraction + risk classification in a single LLM prompt
    drastically cutting latency on CPU hardware.
    """
    llm = get_llm()
    context = _get_targeted_context(document_id)

    if not context.strip():
        return {
            "error": "Could not retrieve document content. Please re-upload.",
            "overall_risk_level": "UNKNOWN",
            "executive_summary": "Analysis failed — document content unavailable.",
        }

    prompt = UNIFIED_ANALYSIS_PROMPT.format(context=context[:4500])
    raw_output = llm.invoke(prompt)
    data = _safe_parse_json(str(raw_output))

    return {
        "deal_title": data.get("deal_title") or document_name,
        "deal_type": data.get("deal_type", "M&A Agreement"),
        "deal_value": data.get("deal_value", "Not specified"),
        "governing_law": data.get("governing_law", "Not specified"),
        "jurisdiction": data.get("jurisdiction", "Not specified"),
        "signing_date": data.get("signing_date"),
        "closing_date": data.get("closing_date"),
        "parties": data.get("parties", []),
        "conditions_precedent": data.get("conditions_precedent", []),
        "representations_warranties": data.get("representations_warranties", []),
        "indemnification_provisions": data.get("indemnification_provisions", []),
        "non_compete_clauses": data.get("non_compete_clauses", []),
        "mac_clauses": data.get("mac_clauses", []),
        "termination_rights": data.get("termination_rights", []),
        "risk_flags": data.get("risk_flags", []),
        "overall_risk_level": data.get("overall_risk_level", "MEDIUM"),
        "executive_summary": data.get("executive_summary", "Analysis completed."),
        "key_recommendations": data.get("key_recommendations", []),
    }

