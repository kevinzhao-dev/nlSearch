# nlSearch: Natural Language Image & Video Search Engine

This project enables natural language semantic search over local images and videos using Vision-Language Models (VLMs) via OpenAI's Embeddings API and FAISS vector search.

## Features
- Upload images/videos and index them with metadata (album, tags)
- Text and image embedding endpoints
- Semantic search over indexed media with optional album filtering
- Streamlit-based prototype UI

## Tech Stack
- Backend: FastAPI
- Frontend: Streamlit
- Vector DB: FAISS
- Metadata DB: SQLite
- Model API: OpenAI Embeddings

## Setup
1. Clone the repo:
   ```bash
   git clone <repo_url>
   cd nlSearch
   ```
2. Create environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Configure environment variables:
   ```bash
   cp .env.template .env
   # Edit .env with your OpenAI API key
   ```
4. Run the backend server:
   ```bash
   uvicorn backend.main:app --reload
   ```
5. Run the Streamlit frontend:
   ```bash
   streamlit run frontend/app.py
   ```

Media files will be stored in the `data/media` directory by default.

## Docker (optional)
Build and run the application in a Docker container:
```bash
docker build -t nlsearch .
docker run --env-file .env -p 8000:8000 nlsearch
```

## Usage Examples
Interact with the API via `curl` or any HTTP client:

### Text Embedding
```bash
curl -X POST http://localhost:8000/embed/text \
     -H "Content-Type: application/json" \
     -d '{"text": "A cat sitting on a bench"}'
```

### Image Embedding
```bash
curl -X POST http://localhost:8000/embed/image \
     -F "file=@/path/to/image.jpg"
```

### Upload & Index Media
```bash
curl -X POST http://localhost:8000/upload \
     -F "file=@/path/to/image.jpg" \
     -F "media_id=IMG001" \
     -F "album=vacation" \
     -F "tags=beach,sunset"
```

### Semantic Search
```bash
curl -X POST http://localhost:8000/search \
     -H "Content-Type: application/json" \
     -d '{"query": "sunset on the beach", "album": "vacation", "top_k": 5}'
```
