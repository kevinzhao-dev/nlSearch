import sqlite3
import json

class MediaStorage:
    """
    Handles SQLite storage for media metadata.
    """
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self._create_table()

    def _create_table(self):
        c = self.conn.cursor()
        c.execute("""
        CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            media_id TEXT UNIQUE,
            album TEXT,
            tags TEXT,
            path TEXT
        )
        """)
        self.conn.commit()

    def add_media(self, media_id: str, album: str, tags: list, path: str = None) -> int:
        """
        Insert or update media metadata, returns internal db id.
        """
        tags_str = json.dumps(tags)
        c = self.conn.cursor()
        try:
            c.execute(
                "INSERT INTO media (media_id, album, tags, path) VALUES (?, ?, ?, ?)",
                (media_id, album, tags_str, path),
            )
            self.conn.commit()
            return c.lastrowid
        except sqlite3.IntegrityError:
            # Update existing
            c.execute(
                "UPDATE media SET album = ?, tags = ?, path = ? WHERE media_id = ?",
                (album, tags_str, path, media_id),
            )
            self.conn.commit()
            c.execute("SELECT id FROM media WHERE media_id = ?", (media_id,))
            row = c.fetchone()
            return row["id"] if row else None

    def get_media_by_db_id(self, db_id: int) -> dict:
        """
        Retrieve media metadata by internal id.
        """
        c = self.conn.cursor()
        c.execute("SELECT * FROM media WHERE id = ?", (db_id,))
        row = c.fetchone()
        if not row:
            return None
        return {
            "id": row["id"],
            "media_id": row["media_id"],
            "album": row["album"],
            "tags": json.loads(row["tags"]),
            "path": row["path"],
        }

    def get_ids_by_album(self, album: str) -> list:
        """
        Get list of internal ids for a given album.
        """
        c = self.conn.cursor()
        c.execute("SELECT id FROM media WHERE album = ?", (album,))
        return [row["id"] for row in c.fetchall()]