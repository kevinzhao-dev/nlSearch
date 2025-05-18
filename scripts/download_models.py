#!/usr/bin/env python3
"""
Download a CLIP model from the open clip repository in ONNX format.
This script fetches the pre-converted ONNX models provided by
https://github.com/lakeraai/onnx_clip and places them under the ``models``
directory so that the backend can load them.

Unlike the previous version which required PyTorch and ``clip-by-openai`` to
export the model, this script simply clones the repository and copies the
appropriate ``.onnx`` file.
"""

import argparse
import subprocess
import tempfile
import shutil
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(
        description="Download CLIP model from lakeraai/onnx_clip"
    )
    parser.add_argument(
        "--model",
        default="ViT-B-32",
        help="Model name substring to search for within the repository",
    )
    parser.add_argument(
        "--repo",
        default="https://github.com/lakeraai/onnx_clip.git",
        help="Repository URL containing the ONNX models",
    )
    parser.add_argument(
        "--output",
        default="models/clip-model.onnx",
        help="Output path for the ONNX model",
    )
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Cloning {args.repo} ...")
        subprocess.run(["git", "clone", "--depth", "1", args.repo, tmpdir], check=True)
        repo_path = Path(tmpdir)

        pattern = f"*{args.model}*.onnx"
        matches = list(repo_path.rglob(pattern))
        if not matches:
            matches = list(repo_path.rglob("*.onnx"))
        if not matches:
            raise FileNotFoundError("ONNX model not found in repository")

        model_file = matches[0]
        print(f"Found model: {model_file.name}")
        shutil.copy(model_file, output_path)
        print(f"Model saved to {output_path}")


if __name__ == "__main__":
    main()
