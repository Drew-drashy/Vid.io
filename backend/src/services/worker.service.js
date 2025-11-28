import { Worker } from "bullmq";
import VideoJob from "../models/videoJob.models.js";
import Transcript from "../models/transcript.model.js";
import fetch from "node-fetch";

new Worker(
  "embeddingQueue",
  async job => {
    const { jobId, videoId, transcriptId } = job.data;

    const jobDoc = await VideoJob.findById(jobId);
    if (!jobDoc) return;

    jobDoc.status = "processing";
    await jobDoc.save();

    const transcript = await Transcript.findById(transcriptId);

    // Call python embedding service
    await fetch(process.env.EMBEDDING_SERVICE_URL + "/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        videoId,
        transcript:transcript.text
      })
    });

    return { ok: true };
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: 6379
    }
  }
);

console.log("Backend Worker running...");
