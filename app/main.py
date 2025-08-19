from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from .config import settings
from .schemas import IngestText, Query, Remember, ChatTurn, ChatResponse
from .vectorstore import store
from .chunker import chunk_text
from .ollama_client import ollama

import os
import logging
from bs4 import BeautifulSoup
from docx import Document as DocxDocument
from pypdf import PdfReader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ollama RAG API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# --- helpers to read files ---
def read_txt(content: bytes) -> str:
    return content.decode("utf-8", errors="ignore")

def read_md(content: bytes) -> str:
    return content.decode("utf-8", errors="ignore")

def read_html(content: bytes) -> str:
    soup = BeautifulSoup(content, "html.parser")
    return soup.get_text(" ")

def read_pdf(fp) -> str:
    reader = PdfReader(fp)
    texts = []
    for page in reader.pages:
        texts.append(page.extract_text() or "")
    return "\n\n".join(texts)

def read_docx(fp) -> str:
    doc = DocxDocument(fp)
    return "\n".join(p.text for p in doc.paragraphs)

# --- endpoints ---
@app.get("/collections")
def collections():
    return store.stats()

@app.post("/ingest/text")
def ingest_text(payload: IngestText):
    chunks = chunk_text(payload.text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
    ids = store.add_docs(chunks, source=payload.source)
    return {"added": len(ids), "ids": ids}

@app.post("/ingest/file")
async def ingest_file(file: UploadFile = File(...)):
    name = file.filename or "upload"
    ext = os.path.splitext(name)[1].lower()

    if ext in [".txt", ".md"]:
        text = read_txt(await file.read())
    elif ext in [".html", ".htm"]:
        text = read_html(await file.read())
    elif ext == ".pdf":
        text = read_pdf(file.file)
    elif ext == ".docx":
        text = read_docx(file.file)
    else:
        raise HTTPException(400, detail="Unsupported file type")

    chunks = chunk_text(text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
    ids = store.add_docs(chunks, source=name)
    return {"file": name, "chunks": len(chunks), "ids": ids}

@app.post("/remember")
def remember(payload: Remember):
    ids = store.add_memory(payload.fact)
    return {"status": "ok", "ids": ids}

@app.post("/query", response_model=ChatResponse)
def query(payload: Query):
    try:
        top_k = payload.top_k if payload.top_k and payload.top_k > 0 else settings.TOP_K
        doc_context: List[str] = store.search_docs(payload.question, top_k)
        mem_context: List[str] = store.search_memory(payload.question, min(2, top_k))
        context_blocks: List[str] = [*doc_context, *mem_context]

        system = {
            "role": "system",
            "content": (
                "You are a concise assistant. Use the provided CONTEXT to answer. "
                "If the answer is not in context, say you don't know and suggest next steps."
            ),
        }
        user = {
            "role": "user",
            "content": (
                "CONTEXT:\n" + "\n---\n".join(context_blocks) +
                f"\n\nQUESTION: {payload.question}"
            )
        }
        answer = ollama.chat([system, user])
        return ChatResponse(answer=answer, context=context_blocks)
    except Exception as e:
        logger.error(f"/query failed: {e}", exc_info=True)
        raise HTTPException(500, detail=f"Query failed: {str(e)}")

# very simple in-memory chat sessions (process lifetime only)
SESSIONS = {}

@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatTurn):
    try:
        top_k = payload.top_k if payload.top_k and payload.top_k > 0 else settings.TOP_K
        history = SESSIONS.get(payload.session_id, [])

        # retrieve context from docs + personal memories
        doc_context: List[str] = store.search_docs(payload.message, top_k)
        mem_context: List[str] = store.search_memory(payload.message, min(2, top_k))

        messages = [
            {"role": "system", "content": "Be helpful. Prefer grounded answers using CONTEXT."},
            {"role": "user", "content": (
                "CONTEXT:\n" + "\n---\n".join([*doc_context, *mem_context]) +
                f"\n\nUSER: {payload.message}"
            )},
        ]

        # include brief chat history (last 4 turns) for style/continuity
        for turn in history[-4:]:
            messages.insert(1, {"role": "user", "content": turn[0]})
            messages.insert(2, {"role": "assistant", "content": turn[1]})

        answer = ollama.chat(messages)
        history.append((payload.message, answer))
        SESSIONS[payload.session_id] = history

        return ChatResponse(answer=answer, context=[*doc_context, *mem_context])
    except Exception as e:
        logger.error(f"/chat failed: {e}", exc_info=True)
        raise HTTPException(500, detail=f"Chat failed: {str(e)}")

@app.delete("/reset")
def reset():
    store.reset()
    SESSIONS.clear()
    return {"status": "reset", "path": settings.RAG_DIR}
