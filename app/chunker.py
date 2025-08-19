from typing import List
import re

def basic_clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def split_into_paragraphs(text: str) -> List[str]:
    paras = re.split(r"\n\s*\n+", text)
    return [p.strip() for p in paras if p.strip()]

def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> List[str]:
    text = basic_clean(text)
    if len(text) <= chunk_size:
        return [text]
    words = text.split()
    chunks: List[str] = []
    start = 0
    while start < len(words):
        end = min(len(words), start + chunk_size)
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start = max(0, end - overlap)
    return chunks
