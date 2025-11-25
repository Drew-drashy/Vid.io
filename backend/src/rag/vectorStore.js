import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embedding.js";

export async function getVectorStore() {
  return await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: process.env.QDRANT_COLLECTION
  });
}

export async function addChunksToQdrant(chunks, videoId) {
  const store = await getVectorStore();

  const docs = chunks.map(c => 
    new Document({
      pageContent: c,
      metadata: { videoId }
    })
  );

  await store.addDocuments(docs);
}
