# 📸 Natural Language Image & Video Search Engine

## 🧭 Project Purpose

This project aims to build a cross-platform visual search engine that allows users to:
- **Search images or videos using natural language queries**
- **Upload or organize media by album**
- **Index local or uploaded image/video files into searchable vector embeddings**
- **Return semantically relevant results**

The long-term vision is to extend this system with **Vision-Language Models (VLMs)** for improved understanding and generation capabilities (e.g., Q&A over video, video captioning, etc).

---

## 🧱 System Architecture Overview

### Key Components

| Module | Description |
|--------|-------------|
| **Frontend (TypeScript)** | User interface for searching, uploading, viewing results |
| **Backend (C++17)** | Indexing, querying, vector search, model inference |
| **Vector Search** | FAISS (Flat or HNSW) for fast semantic similarity search |
| **Model Inference** | ONNX Runtime to run CLIP or future VLMs |
| **Communication** | gRPC for structured and high-performance API interaction |
| **Build System** | CMake with automated third-party library downloading |
| **Deployment** | Docker for reproducibility across macOS/Linux/Cloud |

---

## 🛠 Tech Stack Details

### Frontend

| Technology | Description |
|------------|-------------|
| TypeScript | Primary frontend language |
| React / Next.js | SPA or SSR for better UX and SEO |
| Tailwind CSS | Utility-first CSS styling |
| gRPC-Web | (Optional) communication with backend over gRPC |

### Backend

| Component | Tool |
|----------|------|
| Language | C++17 |
| Vector Search | FAISS (CPU-only at first) |
| Model Inference | ONNX Runtime (via C++ API) |
| API Protocol | gRPC |
| Build | CMake (with automatic third-party downloads) |
| Platform Support | macOS & Linux (x86, ARM) |

### Optional Libraries
- spdlog / glog – logging
- fmt – string formatting
- jsoncpp or nlohmann/json – config & metadata parsing

---

## 🔄 User Flow

```mermaid
graph LR
A[User Input: Text] --> B[gRPC: Query Request]
C[Image/Video Upload] --> D[gRPC: Indexing Request]
B --> E[Backend: Text to Embedding (ONNX)]
D --> F[Backend: Media to Embedding (ONNX)]
E --> G[FAISS Search]
F --> H[Store Embedding + Metadata]
G --> I[Return Search Results]

