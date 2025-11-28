from fastapi import FastAPI
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
import requests

from embedder import embed_and_store
from splitter import split_into_chunks
from config import BACKEND_URL, MAX_WORKERS, CHUNK_SIZE, CHUNK_OVERLAP

app = FastAPI()
executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)

class ProcessReq(BaseModel):
    jobId: str
    videoId: str
    transcript: str


@app.post("/process")
async def process(req: ProcessReq):
    print(f"[Service] Received job: {req.jobId}")

    executor.submit(run_job, req)

    return {"ok": True, "msg": "job accepted"}


def run_job(req: ProcessReq):
    jobId = req.jobId
    videoId = req.videoId

    try:
        print(f"[Thread] Starting job {jobId}")

        # 1. SPLIT using LangChain splitter
        chunks = split_into_chunks(req.transcript, chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
        print(f"[Split] Transcript → {len(chunks)} chunks")

        # 2. EMBED + STORE
        embed_and_store(videoId, chunks)

        # 3. CALLBACK to Backend
        requests.post(
            f"{BACKEND_URL}/updateStatus",
            json={
                "jobId": jobId,
                "videoId": videoId,
                "status": "completed"
            }
        )

        print(f"[Thread] Job {jobId} completed.")

    except Exception as e:
        print(f"[Error] Job {jobId} failed:", e)

        requests.post(
            f"{BACKEND_URL}/updateStatus",
            json={
                "jobId": jobId,
                "videoId": videoId,
                "status": "failed"
            }
        )
