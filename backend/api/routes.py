import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional

from ..services.embedding import embed_text, embed_image
from ..services.search import SearchEngine
from .schemas import (
    TextEmbedRequest,
    EmbedResponse,
    IndexRequest,
    SearchRequest,
    SearchResponse,
    SearchResult,
)

# Instantiate search engine
search_engine = SearchEngine()
router = APIRouter()

@router.post("/embed/text", response_model=EmbedResponse)
async def embed_text_endpoint(request: TextEmbedRequest):
    try:
        vector = embed_text(request.text)
        return EmbedResponse(vector=vector)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/embed/image", response_model=EmbedResponse)
async def embed_image_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        vector = embed_image(content)
        return EmbedResponse(vector=vector)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_endpoint(
    file: UploadFile = File(...),
    media_id: str = Form(...),
    album: str = Form(...),
    tags: str = Form(""),
):
    try:
        content = await file.read()
        data_dir = os.getenv("DATA_DIR", "data")
        media_dir = os.path.join(data_dir, "media")
        os.makedirs(media_dir, exist_ok=True)
        ext = file.filename.split('.')[-1]
        filename = f"{media_id}.{ext}"
        file_path = os.path.join(media_dir, filename)
        with open(file_path, "wb") as f:
            f.write(content)
        vector = embed_image(content)
        tags_list = [t.strip() for t in tags.split(',')] if tags else []
        search_engine.add(media_id, vector, album, tags_list, file_path)
        return JSONResponse(content={"status": "success", "path": file_path})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/index")
async def index_endpoint(request: IndexRequest):
    try:
        meta = request.metadata
        search_engine.add(
            request.media_id,
            request.vector,
            meta.album,
            meta.tags,
            meta.path,
        )
        return JSONResponse(content={"status": "success"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search", response_model=SearchResponse)
async def search_endpoint(request: SearchRequest):
    try:
        q_vec = embed_text(request.query)
        results = search_engine.search(q_vec, top_k=request.top_k, album=request.album)
        return SearchResponse(results=[SearchResult(**res) for res in results])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
