# Axiom AI — Legal Compliance Platform

> **Harvey-like AI legal compliance platform — 100% free, runs locally.**

## Quick Start

### Prerequisites
1. [Python 3.10+](https://python.org)
2. [Node.js 18+](https://nodejs.org)
3. [Ollama](https://ollama.ai) — free local LLM runtime

### First-Time Setup
```bat
# Run once to install everything
setup.bat
```

### Launch
```bat
start.bat
```
Then open: **http://localhost:5173**

---

## Manual Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Ollama Models (Free)
```bash
ollama pull llama3.1          # Main LLM (8B params)
ollama pull nomic-embed-text  # Embeddings model
```

---

## Tech Stack (All Free)

| Component | Technology |
|-----------|-----------|
| LLM | Ollama + LLaMA 3.1 (local) |
| Embeddings | Ollama nomic-embed-text (local) |
| Vector DB | ChromaDB (local) |
| RAG Framework | LangChain |
| Document Parsing | PyMuPDF + python-docx |
| Backend | FastAPI + SQLite |
| Frontend | React + Tailwind CSS |

---

## Features (Phase 1: M&A)
- ✅ PDF & DOCX document upload
- ✅ Legal-aware document chunking & RAG indexing
- ✅ Automated deal term extraction (parties, value, dates)
- ✅ Key clause analysis (conditions, reps & warranties, MAC, non-competes)
- ✅ Risk flagging with HIGH/MEDIUM/LOW scoring
- ✅ Executive summary generation
- ✅ AI chat Q&A with citations
- ✅ Analysis history & reports

## Roadmap
- 🔲 Contract Review & Redlining
- 🔲 GDPR/Privacy Compliance
- 🔲 Regulatory Tracking
- 🔲 PDF report export
