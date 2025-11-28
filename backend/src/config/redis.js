import Redis from "ioredis";

const redisConfig = {
  port: 6379,
  host: 'localhost',
};

const redisConnection = new Redis(redisConfig);

export default redisConnection;