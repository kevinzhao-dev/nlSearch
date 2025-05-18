import os
import io
from typing import List

from PIL import Image
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Model configurations
TEXT_EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
IMAGE_EMBED_MODEL = os.getenv("IMAGE_EMBEDDING_MODEL", "image-embedding-ada-002")

def embed_text(text: str) -> List[float]:
    """
    Embed a text string using OpenAI Embeddings API.
    """
    response = openai.Embeddings.create(
        model=TEXT_EMBED_MODEL,
        input=text,
    )
    return response["data"][0]["embedding"]

def embed_image(image_bytes: bytes) -> List[float]:
    """
    Embed image bytes using OpenAI Embeddings API.
    """
    try:
        Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ValueError("Invalid image data") from e
    response = openai.Embeddings.create(
        model=IMAGE_EMBED_MODEL,
        input=[image_bytes],
    )
    return response["data"][0]["embedding"]
