import requests
import json
from typing import List, Dict
from .config import settings

class OllamaClient:
    def __init__(self):
        self.base = settings.OLLAMA_HOST.rstrip('/')

    def embed(self, texts: List[str]) -> List[List[float]]:
        embs: List[List[float]] = []
        for t in texts:
            r = requests.post(
                f"{self.base}/api/embeddings",
                json={"model": settings.EMBED_MODEL, "prompt": t}
            )
            r.raise_for_status()
            embs.append(r.json()["embedding"])  # type: ignore
        return embs

    def chat(self, messages: List[Dict[str, str]]) -> str:
        r = requests.post(
            f"{self.base}/api/chat",
            json={"model": settings.CHAT_MODEL, "messages": messages, "stream": False},
            stream=True
        )
        r.raise_for_status()

        output = []
        for line in r.iter_lines():
            if not line:
                continue
            try:
                data = json.loads(line.decode("utf-8"))
                if "message" in data and "content" in data["message"]:
                    output.append(data["message"]["content"])
            except Exception:
                continue
        return "".join(output).strip()

ollama = OllamaClient()