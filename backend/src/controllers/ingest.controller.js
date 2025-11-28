import Transcript from "../models/Transcript.model.js";
import VideoJob from "../models/VideoJob.model.js";
import { extractVideoId, fetchTranscript } from "../utils/helpers.js";
import { embeddingQueue } from "../services/queue.service.js";

export const ingestController = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ error: "videoUrl required" });

    const videoId = extractVideoId(videoUrl);

    // 1) Check if transcript exists
    const transcript = await Transcript.findOne({ videoId });

    // 2) Check if job exists
    const existingJob = await VideoJob.findOne({ videoId }).sort({ createdAt: -1 });

    if (transcript && existingJob) {
      if (existingJob.status === "completed") {
        return res.json({
          transcriptId: transcript._id,
          jobId: existingJob._id,
          status: "completed",
          message: "Embeddings already generated"
        });
      }

      if (["queued", "processing", "pending"].includes(existingJob.status)) {
        return res.json({
          transcriptId: transcript._id,
          jobId: existingJob._id,
          status: existingJob.status,
          message: "Already queued/processing"
        });
      }
    }

    // 3) Fetch transcript if not stored
    let transcriptId;
    if (!transcript) {
      const text = await fetchTranscript(videoId);

      const saved = await Transcript.create({
        videoId,
        text
      });

      transcriptId = saved._id;
    } else {
      transcriptId = transcript._id;
    }

    // 4) Create a new job
    const jobDoc = await VideoJob.create({
      videoId,
      transcriptId,
      status: "pending"
    });

    // 5) Queue job for embedding
    const queueJob = await embeddingQueue.add("embedVideo", {
      jobId: jobDoc._id.toString(),
      videoId,
      transcriptId
    });

    // Update job with queue id
    jobDoc.queueId = queueJob.id;
    jobDoc.status = "queued";
    await jobDoc.save();

    return res.json({
      transcriptId,
      jobId: jobDoc._id,
      status: "queued",
      message: "Job queued"
    });

  } catch (err) {
    console.error("Ingest error:", err);
    res.status(500).json({ error: err.message });
  }
};
