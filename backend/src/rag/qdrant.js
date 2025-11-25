import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,

});

// init collection if not exists
export async function initQdrant() {
  const collection = process.env.QDRANT_COLLECTION;

  const exists = await qdrant.getCollection(collection).catch(() => null);

  if (!exists) {
    console.log("⚙️ Creating Qdrant collection...");
    await qdrant.createCollection(collection, {
      vectors: {
        size: 768,
        distance: "Cosine",
      },
    });
  }

  console.log("QDRANT DB CONNECTED");
}
