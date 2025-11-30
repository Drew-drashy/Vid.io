from dotenv import load_dotenv
import os

load_dotenv()  # ← loads .env

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION")

BACKEND_URL = os.getenv("BACKEND_URL")

MAX_WORKERS = int(os.getenv("MAX_WORKERS", 4))
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 800))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 150))
