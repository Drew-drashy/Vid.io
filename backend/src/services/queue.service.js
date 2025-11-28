import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";


export const embeddingQueue = new Queue("embeddingQueue", {
  connection:redisConnection
});
