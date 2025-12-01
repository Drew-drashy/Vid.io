import Transcript from "../models/transcript.model.js";
import { embeddingQueue } from "../services/queue.service.js";
import VideoJob from "../models/videoJob.models.js";
import { extractVideoId } from "../utils/utils.js";
import { fetchTranscript } from "../services/youtube.service.js";

export const ingestController = async (req, res) => {
  try {
  //    console.log("Waiting:", await embeddingQueue.getWaiting());
  // console.log("Active:", await embeddingQueue.getActive());
  // console.log("Delayed:", await embeddingQueue.getDelayed());
  // console.log("Completed:", await embeddingQueue.getCompleted());
  // console.log("Failed:", await embeddingQueue.getFailed());
    const { videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ error: "videoUrl required" });

    const videoId = extractVideoId(videoUrl);

    // 1) Check if transcript exists
    let transcript = await Transcript.findOne({ videoId });

    // 2) Check if job exists
    const existingJob = await VideoJob.findOne({ videoId }).sort({ createdAt: -1 });

    if (transcript && !transcript.text) {
      // Existing transcript record but no text stored: refetch to avoid bad jobs
      const refetched = await fetchTranscript(videoId);
      if (!refetched) {
        throw new Error("Transcript fetch returned empty text");
      }
      transcript.text = refetched;
      await transcript.save();
    }

    if (transcript && existingJob) {
      if (existingJob.status === "completed") {
        return res.json({
          transcriptId: transcript._id,
          jobId: existingJob._id,
          status: "completed",
          message: "Embeddings already generated"
        });
      }

      if ([ "processing", "pending"].includes(existingJob.status)) {
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
      if (!text) {
        throw new Error("Transcript fetch returned empty text");
      }

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
    jobDoc.status = "processing";
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
