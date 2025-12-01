import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  
});


export async function initQdrant() {
  const collection = process.env.QDRANT_COLLECTION;
  const vectorSize = Number(process.env.QDRANT_VECTOR_SIZE || 384);

  if (!collection) {
    throw new Error("QDRANT_COLLECTION env var is required");
  }

  const existing = await qdrant.getCollection(collection).catch((err) => {
    if (err?.status === 403) {
      throw new Error(
        "Qdrant key is scoped and cannot read collections. Use a global/management key or pre-create the collection."
      );
    }
    return null;
  });

  if (!existing) {
    console.log("⚙️ Creating Qdrant collection...");
    try {
      await qdrant.createCollection(collection, {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
      });
    } catch (err) {
      if (err?.status === 403) {
        console.warn(
          "⚠️ Qdrant key cannot create collections (Forbidden). Assuming collection already exists; if not, create it manually or use a global key."
        );
      } else {
        throw err;
      }
    }
  }

  console.log("⚙️ Ensuring 'videoId' keyword index exists...");
  await qdrant.createPayloadIndex(collection, {
    field_name: "videoId",
    field_schema: "keyword",
  }).catch((err) => {
    if (err?.status === 403) {
      console.warn("⚠️ Qdrant key lacks permission to create payload indexes. Ensure index exists or use a broader key.");
    } else if (err?.status === 409) {
      // Index already exists
      return;
    } else {
      throw err;
    }
  });
  
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
