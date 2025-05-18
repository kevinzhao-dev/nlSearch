#!/bin/bash

# Script to start the nlSearch application with Docker Compose

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Create data and models directories if they don't exist
mkdir -p "$ROOT_DIR/data"
mkdir -p "$ROOT_DIR/models"

# Check if the CLIP model exists
if [ ! -f "$ROOT_DIR/models/clip-model.onnx" ]; then
    echo "CLIP model not found. Downloading..."
    
    # Create a temporary Python virtual environment
    VENV_DIR=$(mktemp -d)
    python3 -m venv "$VENV_DIR"
    
    # Activate the virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Install dependencies
    pip install torch clip-by-openai
    
    # Run the download script
    python "$ROOT_DIR/scripts/download_models.py"
    
    # Deactivate the virtual environment
    deactivate
    
    # Clean up
    rm -rf "$VENV_DIR"
    
    echo "CLIP model downloaded successfully."
fi

# Build and start the Docker containers
cd "$ROOT_DIR"
docker-compose up --build

exit 0