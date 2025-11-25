import { fetchTranscript } from "../services/youtube.service.js";
import { ingestVideoTranscript } from "../services/ingest.service.js";
import { extractVideoId } from "../utils/utils.js";

export const ingestController = async (req, res) => {
  const { videoUrl } = req.body;

  const videoId = extractVideoId(videoUrl);
  const text = await fetchTranscript(videoId);

  const transcriptId = await ingestVideoTranscript(videoId, text);

  res.json({ transcriptId, videoId });
};