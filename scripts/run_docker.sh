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
    python3 "$ROOT_DIR/scripts/download_models.py"
    echo "CLIP model downloaded successfully."
fi

# Build and start the Docker containers
cd "$ROOT_DIR"
docker-compose up --build

exit 0