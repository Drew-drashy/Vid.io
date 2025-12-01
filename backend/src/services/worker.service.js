import "dotenv/config";
import { Worker } from "bullmq";
import VideoJob from "../models/videoJob.models.js";
import Transcript from "../models/transcript.model.js";
import fetch from "node-fetch";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { fetchTranscript } from "./youtube.service.js";

async function ensureDbConnected() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI env var is not set");
  }
  if (mongoose.connection.readyState === 1) return;
  await connectDB();
}

new Worker(
  "embeddingQueue",
  async job => {
    const { jobId, videoId, transcriptId } = job.data;
    let jobDoc;

    try {
      await ensureDbConnected();

      jobDoc = await VideoJob.findById(jobId);
      if (!jobDoc) throw new Error(`Job ${jobId} not found`);

      jobDoc.status = "processing";
      await jobDoc.save();

      const transcript = await Transcript.findById(transcriptId);
      if (!transcript) throw new Error(`Transcript ${transcriptId} not found`);
      if (!transcript.text) {
        // Defensive: attempt to refetch transcript text if missing
        const fetched = await fetchTranscript(videoId);
        if (!fetched) {
          throw new Error(`Transcript ${transcriptId} has no text payload and refetch failed`);
        }
        transcript.text = fetched;
        await transcript.save();
      }

      console.log("[Worker] Processing job", jobId, "video", videoId, "transcript len", transcript.text?.length ?? 0);

      // Call python embedding service
      const response = await fetch(process.env.EMBEDDING_SERVICE_URL + "/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          videoId,
          transcript: transcript.text
        })
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Embedding service returned ${response.status} ${response.statusText}${body ? `: ${body}` : ""}`);
      }

      return { ok: true };
    } catch (err) {
      console.error("Worker error processing job:", err);

      if (jobDoc) {
        jobDoc.status = "failed";
        jobDoc.errorMessage = err.message;
        jobDoc.updatedAt = new Date();
        await jobDoc.save();
      }

      throw err;
    }
  },
  {
    connection: {
      url: process.env.REDIS_HOST,
      // tls:{}
    }
  }
);

console.log("Backend Worker running...");
