import { Queue } from "bullmq";


export const embeddingQueue = new Queue("embeddingQueue", {
  connection:{
    url : process.env.REDIS_HOST,
  }
});
