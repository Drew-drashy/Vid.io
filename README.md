# Vid.io
AI sidekick that lets you search YouTube videos, ingest the transcript, and chat with them using RAG.

## Architecture
- **Frontend (Vite + React + Tailwind + RTK Query)** – YouTube search (RapidAPI or mock), drag/drop or paste a link, shows job/embedding status, and chats against the selected video.
- **Backend (Express + BullMQ + MongoDB + Qdrant + Gemini)** – Fetches transcripts (Supadata), creates jobs, queues embedding work to Redis/BullMQ workers, writes vectors to Qdrant, and answers questions through a Gemini agent with a retrieve tool.
- **Embedding Service (FastAPI + HuggingFace `thenlper/gte-base`)** – Splits transcripts, embeds chunks, stores them in Qdrant, and posts job status back to the backend.

Data flow: user attaches a YouTube URL → backend fetches transcript and enqueues a job → worker calls the Python embedding service → service chunks/embeds and stores vectors in Qdrant → service notifies backend job status → frontend polls until ready → questions hit `/api/query`, which runs Gemini + Qdrant retrieval.

## Requirements
- Node 20+, npm
- Python 3.10+
- MongoDB
- Redis (BullMQ queue)
- Qdrant instance reachable from both backend and embedding service
- API keys: `SUPADATA_API_KEY` (transcripts), `GEMINI_API_KEY` (LLM), optional `VITE_RAPIDAPI_KEY` (live YouTube search)

## Environment

**backend/.env**
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vidio
REDIS_HOST=redis://localhost:6379

EMBEDDING_SERVICE_URL=http://localhost:5001
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-key
QDRANT_COLLECTION=vidio
QDRANT_VECTOR_SIZE=768   # matches gte-base

GEMINI_API_KEY=your-gemini-key
SUPADATA_API_KEY=your-supadata-key
```

**EmbeddingService/.env**
```
BACKEND_URL=http://localhost:4000
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-key
QDRANT_COLLECTION=vidio
CHUNK_SIZE=800
CHUNK_OVERLAP=150
MAX_WORKERS=4
```

**frontend/.env**
```
VITE_API_BASE=http://localhost:4000/api
VITE_RAPIDAPI_KEY=your-rapidapi-key   # optional, otherwise mock search is used
```

Ensure the Qdrant collection dimension matches the embedding model (`thenlper/gte-base` → 768 dims) and the `QDRANT_COLLECTION` name is consistent for backend and embedding service.

## Run locally
1) Start dependencies: MongoDB, Redis, and Qdrant.

2) Backend
```
cd backend
npm install
npm run dev
```

3) Embedding service
```
cd EmbeddingService
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 5001
```

4) Frontend
```
cd frontend
npm install
npm run dev
```
Visit the Vite dev URL (typically http://localhost:5173).

## API quick reference (backend)
- `POST /api/ingest` – `{ videoUrl }` → starts transcript fetch + embedding job; returns `jobId`, `transcriptId`, and status.
- `GET /api/job/status/:jobId` – returns job status (`pending|processing|completed|failed` plus error/progress).
- `POST /api/query` – `{ question, videoId }` → runs Gemini agent with retrieve tool over Qdrant; returns `{ answer }`.

Embedding service:
- `POST /process` – `{ jobId, videoId, transcript }` (internal; called by backend worker).
- `POST /embed-query` – `{ text }` → returns a single embedding (used by backend for search).

## Notes
- Transcript fetch uses Supadata; ensure the `SUPADATA_API_KEY` is valid.
- BullMQ requires `REDIS_HOST` to be reachable from both server and worker (worker runs inside the backend codebase).
- If you change the embedding model, update `QDRANT_VECTOR_SIZE` and recreate the Qdrant collection to match the new dimension.
