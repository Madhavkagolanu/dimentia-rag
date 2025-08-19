from typing import List, Dict, Any
import os
import chromadb
from chromadb.config import Settings as ChromaSettings
from .config import settings
from .ollama_client import ollama

class VectorStore:
    def __init__(self):
        os.makedirs(settings.RAG_DIR, exist_ok=True)
        self.client = chromadb.PersistentClient(path=settings.RAG_DIR, settings=ChromaSettings(allow_reset=True))
        self.docs = self.client.get_or_create_collection(settings.DOCS_COLLECTION)
        self.mem = self.client.get_or_create_collection(settings.MEM_COLLECTION)

    # --- generic helpers ---
    def _add(self, collection, texts: List[str], metadatas: List[Dict[str, Any]]):
        ids = [metadatas[i].get("id") or str(collection.count() + i) for i in range(len(texts))]
        embs = ollama.embed(texts)
        collection.add(ids=ids, documents=texts, embeddings=embs, metadatas=metadatas)
        return ids

    # --- documents ---
    def add_docs(self, chunks: List[str], source: str):
        metas = [{"source": source, "id": f"doc-{self.docs.count()}-{i}"} for i, _ in enumerate(chunks)]
        return self._add(self.docs, chunks, metas)

    def search_docs(self, query: str, n_results: int) -> List[str]:
        emb = ollama.embed([query])[0]
        res = self.docs.query(query_embeddings=[emb], n_results=n_results)
        return res.get("documents", [[]])[0]

    # --- memories (personal facts) ---
    def add_memory(self, fact: str):
        metas = [{"type": "memory"}]
        return self._add(self.mem, [fact], metas)

    def search_memory(self, query: str, n_results: int) -> List[str]:
        emb = ollama.embed([query])[0]
        res = self.mem.query(query_embeddings=[emb], n_results=n_results)
        return res.get("documents", [[]])[0]

    def stats(self):
        return {
            "docs_count": self.docs.count(),
            "mem_count": self.mem.count(),
            "path": settings.RAG_DIR,
        }

    def reset(self):
        self.client.reset()

store = VectorStore()
