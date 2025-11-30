from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import RetrievalMode
import os
import uuid





embeddings = HuggingFaceEmbeddings(model_name="thenlper/gte-base")

# 🔥 Create Qdrant Cloud client
vectorstore = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    collection_name= COLLECTION_NAME,
    url= QDRANT_URL,
    api_key=QDRANT_API_KEY,
    retrieval_mode=RetrievalMode.DENSE   #
)

def embed_and_store(video_id: str, chunks: list[str]):
    print(f"[Embedding] {video_id} → {len(chunks)} chunks")

    docs = [
        Document(page_content=chunk, metadata={"videoId": video_id, "index": i})
        for i, chunk in enumerate(chunks)
    ]
    # ids = [str(uuid.uuid4()) for _ in docs]

    ids = [str(uuid.uuid4())  for i in range(len(chunks))]

    vectorstore.add_documents(documents=docs, ids=ids)

    print(f"[Qdrant] Stored {len(docs)} vectors for video {video_id}")
def embed_query_text(text: str):
    """Generate a query embedding using the SAME model used for storage."""
    vector = embeddings.embed_query(text)
    return vector
