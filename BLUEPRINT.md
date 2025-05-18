# 🔍 Natural Language Image & Video Search Engine (VLM API-Based)

## 📌 Project Overview

This project enables **natural language search over local images and videos** using **Vision-Language Models (VLMs)** such as OpenAI's GPT-4o or Gemini API. It supports:

- Image/video upload and indexing
- Semantic vector search powered by VLM API
- Search results returned by relevance
- Album / category based filtering (granularity-aware search)

Backend is implemented in **Python using FastAPI**, with potential future migration to **local inference (e.g. vLLM or OpenVINO)** via modular abstraction. Frontend is prototyped using **Streamlit** for quick iteration and testing.

---

## 🛠 Tech Stack

| Component  | Technology                         |
| ---------- | ---------------------------------- |
| Backend    | Python + FastAPI                   |
| Frontend   | Python + Streamlit (temporary UI)  |
| Vector DB  | FAISS + SQLite (or pgvector later) |
| Model API  | OpenAI GPT-4o (via `openai` lib)   |
| Deployment | Docker + `.env` config             |

---

## 📁 Folder Structure

```
vlm-search/
├── backend/
│   ├── api/
│   │   ├── routes.py          # FastAPI route definitions
│   │   └── schemas.py         # Pydantic models
│   ├── services/
│   │   ├── embedding.py       # OpenAI or vLLM embedding wrapper
│   │   └── search.py          # FAISS vector search logic
│   ├── models/
│   │   └── storage.py         # SQLite or PostgreSQL metadata handler
│   └── main.py                # FastAPI app entry point
├── frontend/
│   └── app.py                 # Streamlit UI interface
├── data/
│   └── media/                 # Uploaded images/videos
├── Dockerfile
├── requirements.txt
├── .env.template
└── README.md
```

---

## 🔧 Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/kevinzhao-dev/nlSearch.git
cd vlm-search
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the template and fill in your keys:

```bash
cp .env.template .env
```

`.env.template`

```env
OPENAI_API_KEY=sk-xxx
EMBEDDING_MODEL=text-embedding-3-small
VLM_MODEL=gpt-4o
```

### 3. Launch Backend

```bash
uvicorn backend.main:app --reload
```

### 4. Launch Frontend (Prototype)

```bash
streamlit run frontend/app.py
```

---

## 📦 API Design

### 🔹 `/embed/text`

```http
POST /embed/text
{
  "text": "A man walking a dog in the park"
}
→ Returns embedding vector
```

### 🔹 `/embed/image`

```http
POST /embed/image
FormData: image file
→ Returns embedding vector
```

### 🔹 `/index`

```http
POST /index
{
  "media_id": "IMG001",
  "vector": [...],
  "metadata": {
    "album": "vacation",
    "tags": ["beach", "sunset"]
  }
}
→ Stores in FAISS and DB
```

### 🔹 `/search`

```http
POST /search
{
  "query": "sunset on the beach",
  "album": "vacation"
}
→ Returns list of similar images
```

---

## 🔄 Swappable Inference Layer

Backend uses `services/embedding.py` as abstraction:

```python
# backend/services/embedding.py

def embed_text(text: str) -> List[float]:
    # Call OpenAI GPT-4o or replace with local vLLM
    ...

def embed_image(image_bytes: bytes) -> List[float]:
    # VLM-based visual embedding (OpenAI or future local)
    ...
```

To switch to local inference (e.g. vLLM or CLIP+BLIP):

- Replace this module only.
- Maintain same input/output interface.

---

## 🧪 `requirements.txt`

```txt
fastapi
uvicorn
python-dotenv
openai
streamlit
faiss-cpu
pydantic
pillow
```

---

## 🐳 `Dockerfile`

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY . /app

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📌 Future Extensions

- Switch backend to `vLLM` or `Gemma` for offline inference
- Add video summarization & keyframe embedding
- Enable Q\&A over video scenes (multimodal reasoning)
- Multi-user support with auth & cloud sync

---

## 🤝 Contributions

Interns should write clean code with type hints and docstrings. PRs should include:

- New tests or sample scripts
- Description of what was changed and why
