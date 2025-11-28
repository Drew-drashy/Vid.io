import VideoJob from "../models/videoJob.models.js";

export const updateJobStatus = async (req, res) => {
  try {
    const { jobId, videoId, status, errorMessage, progress } = req.body;

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

    // attach error message if status failed
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
