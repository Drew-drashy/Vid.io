import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3001")
QDRANT_URL = os.getenv("QDRANT_URL", "https://d1912f40-5bd5-426b-9e33-3426c87ebb85.us-east4-0.gcp.cloud.qdrant.io")

MAX_WORKERS = int(os.getenv("MAX_WORKERS", 4))

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 800))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 150))
