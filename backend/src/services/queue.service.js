import { Queue } from "bullmq";

export const embeddingQueue = new Queue("embeddingQueue", {
  connection: {
    host: "localhost",
    port: 6379
  }
});
