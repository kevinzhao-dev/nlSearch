#!/usr/bin/env python3
"""
Download CLIP model and convert to ONNX format.
This script downloads the OpenAI CLIP model and converts it to ONNX format
for use with nlSearch.
"""

import os
import argparse
import torch
import clip
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Download CLIP model and convert to ONNX")
    parser.add_argument(
        "--model", 
        default="ViT-B/32", 
        choices=["ViT-B/32", "ViT-B/16", "ViT-L/14", "RN50", "RN101"],
        help="CLIP model to download"
    )
    parser.add_argument(
        "--output", 
        default="models/clip-model.onnx",
        help="Output path for ONNX model"
    )
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Downloading CLIP model: {args.model}")
    
    # Load the model
    model, preprocess = clip.load(args.model, device="cpu")
    model.eval()
    
    # Create dummy inputs
    batch_size = 1
    text_input = torch.zeros((batch_size, 77), dtype=torch.int64)  # Max token length is 77
    image_input = torch.zeros((batch_size, 3, 224, 224), dtype=torch.float32)
    
    # Export to ONNX
    print(f"Exporting model to ONNX: {args.output}")
    torch.onnx.export(
        model,
        (text_input, image_input),
        args.output,
        input_names=["input_ids", "pixel_values"],
        output_names=["text_embeds", "image_embeds"],
        dynamic_axes={
            "input_ids": {0: "batch_size"},
            "pixel_values": {0: "batch_size"},
            "text_embeds": {0: "batch_size"},
            "image_embeds": {0: "batch_size"},
        },
        opset_version=12,
    )
    
    print(f"ONNX model saved to {args.output}")


if __name__ == "__main__":
    main()