import VideoJob from "../models/videoJob.models.js";

export const updateJobStatus = async (req, res) => {
  try {
    const { jobId, videoId, status, errorMessage, progress } = req.body;
    console.log('in the udpate completed')

    if (!jobId || !status) {
      return res.status(400).json({
        ok: false,
        msg: "jobId and status are required",
      });
    }

    const updateObj = {
      status,
      updatedAt: new Date(),
    };

    // attach progress if available
    if (progress !== undefined) {
      updateObj.progress = progress;
    }

    if (status === "failed" && errorMessage) {
      updateObj.errorMessage = errorMessage;
    }

    const job = await VideoJob.findByIdAndUpdate(jobId, updateObj, {
      new: true,
    });

    if (!job) {
      return res.status(404).json({
        ok: false,
        msg: "Job not found",
      });
    }

    return res.json({
      ok: true,
      msg: "Job updated",
      job,
    });
  } catch (err) {
    console.error("Error updating job:", err);
    return res.status(500).json({
      ok: false,
      msg: "Server error",
    });
  }
};
export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        ok: false,
        msg: "jobId is required",
      });
    }

    // Fetch job from MongoDB
    const job = await VideoJob.findById(jobId);

    if (!job) {
      return res.status(404).json({
        ok: false,
        msg: "Job not found",
      });
    }

    return res.json({
      ok: true,
      job: {
        id: job._id,
        videoId: job.videoId,
        status: job.status,          // pending | processing | completed | failed
        progress: job.progress || 0, // optional
        errorMessage: job?.errorMessage || null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error getting job status:", err);
    return res.status(500).json({
      ok: false,
      msg: "Server error",
    });
  }
};
