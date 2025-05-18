from pydantic import BaseModel, Field
from typing import List, Optional

class TextEmbedRequest(BaseModel):
    text: str

class EmbedResponse(BaseModel):
    vector: List[float]

class Metadata(BaseModel):
    album: str
    tags: List[str]
    path: Optional[str] = None

class IndexRequest(BaseModel):
    media_id: str
    vector: List[float]
    metadata: Metadata

class SearchRequest(BaseModel):
    query: str
    album: Optional[str] = None
    top_k: Optional[int] = Field(default=10, ge=1)

class SearchResult(BaseModel):
    media_id: str
    album: str
    tags: List[str]
    path: Optional[str] = None
    score: float

class SearchResponse(BaseModel):
    results: List[SearchResult]
