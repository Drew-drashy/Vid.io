import { addChunksToQdrant } from "../rag/vectorStore.js";
import { saveTranscript } from "./transcript.service.js";
import { splitAndEmbed } from "./embeddingClient.js";

export async function ingestVideoTranscript(videoId, text) {

  const doc = await saveTranscript(videoId, text);
  const { chunks, vectors, dimension } = await splitAndEmbed(text);
  await addChunksToQdrant(chunks, videoId, vectors, dimension);

  return doc._id;
} 
