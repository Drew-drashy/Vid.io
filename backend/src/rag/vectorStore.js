import crypto from "crypto";
import { qdrant } from "./qdrant.js";
import { embedTexts } from "../services/embeddingClient.js";

const collectionName = process.env.QDRANT_COLLECTION;
const expectedDim = Number(process.env.QDRANT_VECTOR_SIZE || 384);

export async function addChunksToQdrant(
  chunks,
  videoId,
  vectorsFromService,
  dimensionFromService
) {
  const vectors =
    vectorsFromService && Array.isArray(vectorsFromService)
      ? vectorsFromService
      : await embedTexts(chunks);

  if (dimensionFromService && dimensionFromService !== expectedDim) {
    console.warn(
      `⚠️ Embedding dimension (${dimensionFromService}) does not match QDRANT_VECTOR_SIZE (${expectedDim}). Ensure collection schema matches.`
    );
  }

  const points = vectors.map((vector, idx) => ({
    id: crypto.randomUUID(),
    vector,
    payload: {
      videoId,
      text: chunks[idx]
    }
  }));

  await qdrant.upsert(collectionName, { points });
}

export async function searchSimilarChunks(query, videoId, limit = 5) {
  const [vector] = await embedTexts([query]);

  const results = await qdrant.search(collectionName, {
    vector,
    limit,
    filter: videoId
      ? {
          must: [
            {
              key: "metadata.videoId",
              match: { value: videoId }
            }
          ]
        }
      : undefined
  });

  return results;
}
