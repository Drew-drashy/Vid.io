import os
import uuid
from typing import Optional

from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore, RetrievalMode

from config import QDRANT_API_KEY, QDRANT_COLLECTION, QDRANT_URL

embeddings = HuggingFaceEmbeddings(model_name="thenlper/gte-base")
_vectorstore: Optional[QdrantVectorStore] = None


def get_vectorstore() -> QdrantVectorStore:
    """Lazily initialize the Qdrant vector store so the service can start even if Qdrant is down."""
    global _vectorstore
    if _vectorstore:
        return _vectorstore

    missing = [
        name
        for name, value in {
            "QDRANT_URL": QDRANT_URL,
            "QDRANT_API_KEY": QDRANT_API_KEY,
            "QDRANT_COLLECTION": QDRANT_COLLECTION,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing required env vars for Qdrant: {', '.join(missing)}")

    try:
        _vectorstore = QdrantVectorStore.from_existing_collection(
            embedding=embeddings,
            collection_name=QDRANT_COLLECTION,
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            retrieval_mode=RetrievalMode.DENSE,
        )
        return _vectorstore
    except Exception as exc:  # pragma: no cover - defensive logging path
        raise RuntimeError(f"Unable to connect to Qdrant at {QDRANT_URL}: {exc}") from exc


def embed_and_store(video_id: str, chunks: list[str]):
    print(f"[Embedding] {video_id} → {len(chunks)} chunks")

    docs = [
        Document(page_content=chunk, metadata={"videoId": video_id, "index": i})
        for i, chunk in enumerate(chunks)
    ]
    ids = [str(uuid.uuid4()) for _ in range(len(chunks))]

    store = get_vectorstore()
    store.add_documents(documents=docs, ids=ids)

    print(f"[Qdrant] Stored {len(docs)} vectors for video {video_id}")


def embed_query_text(text: str):
    """Generate a query embedding using the SAME model used for storage."""
    vector = embeddings.embed_query(text)
    return vector
