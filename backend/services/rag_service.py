"""
RAG Pipeline Service
- Uses ChromaDB as free local vector store
- Uses Ollama nomic-embed-text for free local embeddings
- Uses Ollama llama3.1/mistral for free local LLM inference
- Hybrid retrieval: dense vector search + keyword filtering
"""
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.documents import Document as LCDocument
from typing import List, Tuple

from config import settings


# ─── ChromaDB Client ──────────────────────────────────────────────────────────

def get_chroma_client():
    return chromadb.PersistentClient(
        path=settings.CHROMA_DIR,
        settings=ChromaSettings(anonymized_telemetry=False)
    )


def get_or_create_collection(document_id: str):
    client = get_chroma_client()
    collection_name = f"doc_{document_id.replace('-', '_')}"
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )


# ─── Embeddings & LLM (all local via Ollama) ─────────────────────────────────

def get_embeddings():
    return OllamaEmbeddings(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.OLLAMA_EMBED_MODEL
    )


def get_llm():
    return OllamaLLM(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.OLLAMA_MODEL,
        temperature=0.0,
        num_predict=1200,  # Cap output tokens so it completes in under 60-90s on CPU
    )


# ─── Indexing ─────────────────────────────────────────────────────────────────

def index_document_chunks(document_id: str, chunks: List[str], doc_name: str) -> int:
    """Embed and store all chunks for a document. Returns chunk count."""
    embeddings_fn = get_embeddings()
    collection = get_or_create_collection(document_id)

    # Delete existing entries for this document (re-indexing support)
    try:
        existing = collection.get()
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
    except Exception:
        pass

    if not chunks:
        return 0

    # Batch embed
    chunk_embeddings = embeddings_fn.embed_documents(chunks)

    ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {"document_id": document_id, "doc_name": doc_name, "chunk_index": i}
        for i in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=chunk_embeddings,
        metadatas=metadatas
    )
    return len(chunks)


# ─── Retrieval ────────────────────────────────────────────────────────────────

def retrieve_relevant_chunks(
    document_id: str,
    query: str,
    top_k: int = 6
) -> List[Tuple[str, float]]:
    """Retrieve most relevant chunks for a query. Returns list of (text, score)."""
    embeddings_fn = get_embeddings()
    collection = get_or_create_collection(document_id)

    query_embedding = embeddings_fn.embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents", "distances", "metadatas"]
    )

    if not results["documents"] or not results["documents"][0]:
        return []

    chunks_with_scores = []
    for doc, distance in zip(results["documents"][0], results["distances"][0]):
        similarity = 1 - distance  # cosine distance → similarity
        chunks_with_scores.append((doc, similarity))

    return chunks_with_scores


# ─── RAG Q&A ──────────────────────────────────────────────────────────────────

LEGAL_QA_PROMPT = PromptTemplate(
    input_variables=["context", "question", "chat_history"],
    template="""You are Axiom AI, an expert legal compliance analyst specializing in Mergers & Acquisitions law.

Your role is to analyze legal documents and answer questions with precision, citing specific clauses and sections where applicable.

DOCUMENT CONTEXT (Retrieved Relevant Sections):
{context}

CONVERSATION HISTORY:
{chat_history}

LEGAL QUESTION: {question}

INSTRUCTIONS:
- Answer based ONLY on the provided document context
- Cite specific clauses, sections, or page numbers when available
- If information is not found in the document, clearly state "Not found in the provided document"
- Format your response clearly with structured sections if needed
- Flag any potential legal risks you identify
- Use professional legal language

ANALYSIS:"""
)


def rag_answer(
    document_id: str,
    question: str,
    chat_history: List[dict] = None
) -> Tuple[str, List[str]]:
    """
    Full RAG pipeline: retrieve → augment → generate.
    Returns (answer, source_excerpts)
    """
    chat_history = chat_history or []

    # Retrieve relevant context
    chunks_with_scores = retrieve_relevant_chunks(document_id, question, top_k=6)

    if not chunks_with_scores:
        return (
            "No relevant content found in the document for this question. "
            "Please ensure the document has been properly uploaded and indexed.",
            []
        )

    # Build context string with relevance scores
    context_parts = []
    sources = []
    for i, (chunk, score) in enumerate(chunks_with_scores, 1):
        context_parts.append(f"[EXCERPT {i}] (Relevance: {score:.2f})\n{chunk}")
        sources.append(chunk[:200] + "..." if len(chunk) > 200 else chunk)

    context = "\n\n---\n\n".join(context_parts)

    # Format chat history
    history_text = ""
    for msg in chat_history[-6:]:  # Last 6 messages for context window efficiency
        role = "User" if msg["role"] == "user" else "Axiom AI"
        history_text += f"{role}: {msg['content']}\n"

    # Generate answer
    llm = get_llm()
    prompt = LEGAL_QA_PROMPT.format(
        context=context,
        question=question,
        chat_history=history_text if history_text else "No previous conversation"
    )

    answer = llm.invoke(prompt)
    return str(answer), sources
