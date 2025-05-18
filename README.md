# nlSearch - Natural Language Image & Video Search Engine

A cross-platform visual search engine that enables natural language queries for images and videos.

## 🚀 Features

- Search images and videos using natural language queries
- Upload and organize media by album
- Index local or uploaded media files into searchable vector embeddings
- Return semantically relevant results based on content understanding

## 🏗️ Architecture

- **Frontend**: TypeScript, React/Next.js, Tailwind CSS
- **Backend**: C++17, FAISS for vector search, ONNX Runtime for model inference
- **Communication**: gRPC for high-performance API interaction
- **Deployment**: Docker for cross-platform compatibility

## 🛠️ Prerequisites

- Docker and Docker Compose (for the easiest setup)
- Alternatively:
  - C++17 compatible compiler (GCC 8+, Clang 6+, MSVC 2019+)
  - CMake 3.15+
  - Node.js 16+
  - Python 3.8+ (for model scripts)

## 📦 Quick Start with Docker

The easiest way to get started is with Docker:

```bash
# Clone the repository
git clone https://github.com/yourusername/nlSearch.git
cd nlSearch

# Run the startup script (downloads models and starts Docker)
./scripts/run_docker.sh

# Access the application in your browser
open http://localhost:3000
```

## 📦 Manual Installation

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/nlSearch.git
cd nlSearch

# Set up a Python environment with required packages
python3 -m venv .venv
source .venv/bin/activate
pip install torch
pip install git+https://github.com/openai/CLIP.git

# Download CLIP model and convert to ONNX format
python scripts/download_models.py

# Create build directory
mkdir -p backend/build && cd backend/build

# Configure and build
cmake ..
make -j4

# Run the backend server
./nlsearch_server
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd nlSearch/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 🔧 Usage

1. Start the backend server (either with Docker or manually)
2. Launch the frontend application at http://localhost:3000
3. Upload images/videos to create an index
4. Search using natural language queries like "sunset over mountains" or "people playing basketball"

## 💻 Development

### Backend Structure

```
backend/
├── include/            # Header files
│   ├── api/            # API service headers
│   ├── core/           # Core functionality headers
│   ├── models/         # Model inference headers
│   └── utils/          # Utility function headers
├── src/                # Source files
│   ├── api/            # API service implementation
│   ├── core/           # Core functionality implementation
│   ├── models/         # Model inference implementation
│   └── utils/          # Utility function implementation
├── protos/             # Protocol buffer definitions
└── CMakeLists.txt      # CMake build configuration
```

### Frontend Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   ├── lib/            # Helper functions and API client
│   ├── pages/          # Next.js pages
│   │   ├── api/        # API routes
│   │   └── ...         # Page components
│   └── styles/         # CSS styles
├── package.json        # Dependencies and scripts
└── next.config.js      # Next.js configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.