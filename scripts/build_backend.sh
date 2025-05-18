#!/bin/bash

# Automated build script for the nlSearch C++ backend
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/backend"
BUILD_DIR="$BACKEND_DIR/build"
ONNX_VERSION="1.15.1"

# Determine ONNX Runtime archive based on platform
if [[ "$(uname)" == "Darwin" ]]; then
    if [[ "$(uname -m)" == "arm64" ]]; then
        ONNX_ARCHIVE="onnxruntime-osx-arm64-${ONNX_VERSION}.tgz"
    else
        ONNX_ARCHIVE="onnxruntime-osx-x64-${ONNX_VERSION}.tgz"
    fi
else
    ONNX_ARCHIVE="onnxruntime-linux-x64-${ONNX_VERSION}.tgz"
fi

ONNX_DIR="$BACKEND_DIR/lib/onnxruntime-${ONNX_VERSION}"
ONNX_PATH="$BACKEND_DIR/lib/${ONNX_ARCHIVE}"

# Ensure ONNX Runtime is available
if [ ! -d "$ONNX_DIR" ]; then
    echo "ONNX Runtime not found. Attempting to download ${ONNX_ARCHIVE}..."
    mkdir -p "$BACKEND_DIR/lib"
    if ! curl -L "https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_VERSION}/${ONNX_ARCHIVE}" -o "$ONNX_PATH"; then
        echo "Failed to download ONNX Runtime."
        echo "Please download ${ONNX_ARCHIVE} manually and place it in $BACKEND_DIR/lib."
        exit 1
    fi
    tar -xzf "$ONNX_PATH" -C "$BACKEND_DIR/lib"
fi

# Ensure the CLIP model is available
if [ ! -f "$ROOT_DIR/models/clip-model.onnx" ]; then
    echo "CLIP model not found. Downloading..."
    python3 "$SCRIPT_DIR/download_models.py"
fi

# Create build directory and compile
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"
cmake ..
make -j$(sysctl -n hw.ncpu 2>/dev/null || nproc)

echo "Backend built successfully."

