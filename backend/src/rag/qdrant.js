import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,

});


export async function initQdrant() {
  const collection = process.env.QDRANT_COLLECTION;
  const vectorSize = Number(process.env.QDRANT_VECTOR_SIZE || 384);

  const exists = await qdrant.getCollection(collection).catch(() => null);

  if (!exists) {
    console.log("⚙️ Creating Qdrant collection...");
    await qdrant.createCollection(collection, {
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
    });
  }
 const test = await qdrant.scroll(process.env.QDRANT_COLLECTION, {
  filter: {
    must: [
      {
        key: "videoId",
        match: {
          value: "2pS0KgQtO8Y"
        }
      }
    ]
  },
  limit: 5,
});


console.log("🔥 FILTER TEST RESULT:", JSON.stringify(test, null, 2));

  console.log("QDRANT DB CONNECTED");
}
