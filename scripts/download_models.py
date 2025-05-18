#!/usr/bin/env python3
"""
Download CLIP model from the Lednik7/CLIP-ONNX repository.

This script fetches the pre-converted ONNX model and places it under the
``models`` directory so that the backend can load it. This avoids the need to
install PyTorch or the original ``clip`` package.
"""

import argparse
import urllib.request
import shutil
from pathlib import Path
import sys

def main():
    parser = argparse.ArgumentParser(
        description="Download CLIP ONNX model from Lednik7/CLIP-ONNX"
    )
    parser.add_argument(
        "--url",
        default="https://github.com/Lednik7/CLIP-ONNX/raw/main/ViT-B-32.onnx",
        help="URL of the ONNX model to download",
    )
    parser.add_argument(
        "--output",
        default="models/clip-model.onnx",
        help="Output path for the ONNX model",
    )
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        print(f"Downloading ONNX model from {args.url}")
        with urllib.request.urlopen(args.url) as response, open(output_path, "wb") as out_file:
            shutil.copyfileobj(response, out_file)
        print(f"Model saved to {output_path}")
    except Exception as e:
        print(f"Error: Failed to download ONNX model: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()