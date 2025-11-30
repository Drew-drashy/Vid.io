# Vid.io
A AI tool to chat with the youtube video.

## Local embedding service

The backend now calls a lightweight embedding microservice that runs a local Transformer model (default `Xenova/all-MiniLM-L6-v2`) so you do not need a hosted embeddings API.

1) Install deps: `cd embedding-service && npm install`
2) (Optional) set a local model/cache dir: `TRANSFORMERS_CACHE=./models`
3) Start the service: `npm run dev` (listens on `5050` by default)

Backend settings to add to your `.env`:
- `EMBEDDING_SERVICE_URL=http://localhost:5050/embed`
- `SPLIT_EMBED_URL=http://localhost:5050/split-embed` (optional; defaults to the same host)
- `QDRANT_VECTOR_SIZE=384` (matches the default model; drop/recreate the collection if you previously used 768-dim vectors)

To use a different local model, set `LOCAL_EMBED_MODEL` to any ONNX-compatible model name or path available on disk.

The embedding service also handles transcript chunking (defaults: `CHUNK_SIZE=1000`, `CHUNK_OVERLAP=200`) via `POST /split-embed`, and the backend ingestion flow now calls this endpoint before writing vectors to Qdrant.
