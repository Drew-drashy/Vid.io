import { Transcript } from "../models/transcript.model.js";

export async function saveTranscript(videoId, text) {
  const doc = await Transcript.create({
    videoId,
    text,
  });
  console.log("Transcript saved in DB.")

  return doc;
}

export async function getTranscript(transcriptId) {
  return await Transcript.findById(transcriptId);
}

export async function getTranscriptByVideoId(videoId) {
  return await Transcript.findOne({ videoId });
}
