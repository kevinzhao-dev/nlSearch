import os
import faiss
import numpy as np

from dotenv import load_dotenv
from ..models.storage import MediaStorage

# Load environment variables
load_dotenv()

class SearchEngine:
    """
    Handles FAISS vector index and metadata storage for media.
    """
    def __init__(self):
        data_dir = os.getenv("DATA_DIR", "data")
        os.makedirs(data_dir, exist_ok=True)
        self.index_file = os.path.join(data_dir, "faiss.index")
        db_path = os.path.join(data_dir, "metadata.db")
        self.db = MediaStorage(db_path)
        if os.path.exists(self.index_file):
            self.index = faiss.read_index(self.index_file)
            self.dimension = self.index.d
        else:
            self.index = None
            self.dimension = None

    def add(
        self,
        media_id: str,
        vector: list,
        album: str,
        tags: list,
        path: str = None,
    ):
        """
        Add a new media vector and metadata to the index and storage.
        """
        v = np.array(vector, dtype="float32")
        if self.index is None:
            self.dimension = v.shape[0]
            flat = faiss.IndexFlatL2(self.dimension)
            self.index = faiss.IndexIDMap(flat)
        db_id = self.db.add_media(media_id, album, tags, path)
        ids = np.array([db_id], dtype="int64")
        self.index.add_with_ids(v.reshape(1, -1), ids)
        faiss.write_index(self.index, self.index_file)

    def search(
        self,
        query_vector: list,
        top_k: int = 10,
        album: str = None,
    ) -> list:
        """
        Search the index and return top_k results, optionally filtered by album.
        """
        if self.index is None or self.index.ntotal == 0:
            return []
        qv = np.array(query_vector, dtype="float32").reshape(1, -1)
        if album:
            allowed = set(self.db.get_ids_by_album(album))
            k = min(self.index.ntotal, top_k * 5)
        else:
            k = min(self.index.ntotal, top_k)
        distances, indices = self.index.search(qv, k)
        distances = distances[0]
        indices = indices[0]
        results = []
        for dist, idx in zip(distances, indices):
            if idx < 0:
                continue
            if album and idx not in allowed:
                continue
            meta = self.db.get_media_by_db_id(int(idx))
            if not meta:
                continue
            results.append({
                "media_id": meta["media_id"],
                "album": meta["album"],
                "tags": meta["tags"],
                "path": meta.get("path"),
                "score": float(dist),
            })
            if len(results) >= top_k:
                break
        return results
