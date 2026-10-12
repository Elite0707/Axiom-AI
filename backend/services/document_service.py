"""
Document Ingestion Service
- Accepts PDF and DOCX files
- Parses and extracts text preserving section hierarchy
- Chunks text at clause/paragraph boundaries (not arbitrary token counts)
- Stores metadata in SQLite
"""
import os
import re
import uuid
import shutil
from pathlib import Path
from typing import List, Tuple

import pymupdf as fitz
from docx import Document as DocxDocument

from config import settings


def ensure_dirs():
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


def save_upload(file_bytes: bytes, original_filename: str) -> Tuple[str, str]:
    """Save uploaded file to disk. Returns (file_id, saved_path)."""
    ensure_dirs()
    ext = Path(original_filename).suffix.lower()
    file_id = str(uuid.uuid4())
    saved_name = f"{file_id}{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_name)
    with open(saved_path, "wb") as f:
        f.write(file_bytes)
    return file_id, saved_path


def extract_text_from_pdf(file_path: str) -> Tuple[str, int]:
    """Extract full text from PDF. Returns (text, page_count)."""
    doc = fitz.open(file_path)
    pages = []
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text")
        if text.strip():
            pages.append(f"[PAGE {page_num}]\n{text}")
    return "\n\n".join(pages), len(doc)


def extract_text_from_docx(file_path: str) -> Tuple[str, int]:
    """Extract full text from DOCX preserving paragraph structure."""
    doc = DocxDocument(file_path)
    paragraphs = []
    for para in doc.paragraphs:
        if para.text.strip():
            if para.style.name.startswith("Heading"):
                paragraphs.append(f"\n## {para.text.strip()}\n")
            else:
                paragraphs.append(para.text.strip())
    text = "\n".join(paragraphs)
    # Estimate pages (rough: ~500 words per page)
    word_count = len(text.split())
    page_estimate = max(1, word_count // 500)
    return text, page_estimate


def extract_text(file_path: str) -> Tuple[str, int]:
    """Route to correct extractor based on file extension."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def chunk_legal_text(text: str, chunk_size: int = 800, overlap: int = 150) -> List[str]:
    """
    Legal-aware chunking:
    - Prefers splitting at section/article/clause boundaries
    - Falls back to paragraph boundaries
    - Then to sentence boundaries
    - Adds overlap to preserve cross-boundary context
    """
    # Patterns that signal legal clause/section boundaries
    section_pattern = re.compile(
        r'\n(?=\s*(?:SECTION|ARTICLE|CLAUSE|SCHEDULE|EXHIBIT|ANNEX|\d+\.|[A-Z]{2,})\s)',
        re.IGNORECASE
    )

    # First split at section boundaries
    sections = section_pattern.split(text)

    chunks = []
    current_chunk = ""

    for section in sections:
        # If section itself is too long, split by paragraphs
        if len(section) > chunk_size * 2:
            paragraphs = re.split(r'\n{2,}', section)
            for para in paragraphs:
                if len(current_chunk) + len(para) < chunk_size:
                    current_chunk += "\n\n" + para
                else:
                    if current_chunk.strip():
                        chunks.append(current_chunk.strip())
                    current_chunk = para
        else:
            if len(current_chunk) + len(section) < chunk_size:
                current_chunk += "\n\n" + section
            else:
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                # Add overlap from previous chunk
                overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
                current_chunk = overlap_text + "\n\n" + section

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return [c for c in chunks if len(c) > 50]  # filter noise
