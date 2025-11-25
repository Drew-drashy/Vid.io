import { splitter } from "../rag/splitter.js";
import { addChunksToQdrant } from "../rag/vectorStore.js";
import { saveTranscript } from "./transcript.service.js";

export async function ingestVideoTranscript(videoId, text) {

  const doc = await saveTranscript(videoId, text);
  const chunks = await splitter.splitText(text);
  await addChunksToQdrant(chunks, videoId);

  return doc._id;
} 
