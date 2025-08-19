from pydantic import BaseModel
from typing import Optional, List

class IngestText(BaseModel):
    text: str
    source: str = "api"

class Query(BaseModel):
    question: str
    top_k: Optional[int] = None

class Remember(BaseModel):
    fact: str

class ChatTurn(BaseModel):
    session_id: str
    message: str
    top_k: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    context: List[str]