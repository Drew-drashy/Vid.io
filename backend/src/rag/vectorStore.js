import { QdrantVectorStore } from "@langchain/qdrant";
import {  NoOpEmbeddings } from "./embedding.js";

export async function getVectorStore() {
  return await QdrantVectorStore.fromExistingCollection(new NoOpEmbeddings(), {
    url: process.env.QDRANT_URL,
    collectionName: process.env.QDRANT_COLLECTION
  });
}

