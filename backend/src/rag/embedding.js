import { Embeddings } from "@langchain/core/embeddings";

export class NoOpEmbeddings extends Embeddings {
  async embedDocuments() {
    throw new Error("Not supported. Use Python service.");
  }
  async embedQuery() {
    throw new Error("Not supported. Use Python service.");
  }
}
