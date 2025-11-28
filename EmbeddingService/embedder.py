from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
import os

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "videos")

# Load model once
print("[Model] Loading SentenceTransformer…")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("[Model] Ready.")

# Create a Qdrant client for cloud
client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

# IMPORTANT: LangChain wrapper for Qdrant
vector_store = QdrantVectorStore.from_existing_collection(
    embedding=model,           # custom embedding fn
    client=client,
    collection_name=COLLECTION_NAME,
)


def embed_and_store(video_id: str, chunks: list[str]):
    print(f"[Embedding] {video_id} → {len(chunks)} chunks")

    # Convert chunks into LangChain Document objects
    docs = [
        Document(
            page_content=chunk,
            metadata={"videoId": video_id, "index": i}
        )
        for i, chunk in enumerate(chunks)
    ]

    # Append into Qdrant Cloud collection
    uuids = [f"{video_id}-{i}" for i in range(len(chunks))]

    vector_store.add_documents(documents=docs, ids=uuids)

    print(f"[Qdrant] Successfully inserted {len(docs)} vectors for video {video_id}")
