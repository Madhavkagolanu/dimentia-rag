# rag_basic.py
from fastapi import FastAPI
from pydantic import BaseModel
import chromadb
import requests

OLLAMA_HOST = "http://localhost:11434"   # ollama serve runs here
CHAT_MODEL = "llama3.1:8b"
EMBED_MODEL = "nomic-embed-text"

# --- ChromaDB (vector storage) ---
chroma_client = chromadb.PersistentClient(path="./rag_store")
collection = chroma_client.get_or_create_collection("docs")

# --- Ollama helpers ---
def embed(text: str):
    r = requests.post(f"{OLLAMA_HOST}/api/embeddings",
                      json={"model": EMBED_MODEL, "prompt": text})
    return r.json()["embedding"]

def chat(messages):
    r = requests.post(f"{OLLAMA_HOST}/api/chat",
                      json={"model": CHAT_MODEL, "messages": messages})
    return r.json()["message"]["content"]

# --- API ---
app = FastAPI()

class Ingest(BaseModel):
    text: str

class Query(BaseModel):
    question: str

@app.post("/ingest")
def ingest(req: Ingest):
    emb = embed(req.text)
    doc_id = str(len(collection.get()['ids']))  # simple incremental id
    collection.add(documents=[req.text], embeddings=[emb], ids=[doc_id])
    return {"status": "stored", "id": doc_id}

@app.post("/query")
def query(req: Query):
    q_emb = embed(req.question)
    results = collection.query(query_embeddings=[q_emb], n_results=3)
    context = " ".join(results["documents"][0]) if results["documents"] else ""
    messages = [
        {"role": "system", "content": "Answer using the given context."},
        {"role": "user", "content": f"Context: {context}\n\nQuestion: {req.question}"}
    ]
    answer = chat(messages)
    return {"answer": answer, "context": context}
