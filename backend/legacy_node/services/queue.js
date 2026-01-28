const Redis = require("ioredis");
const { Queue } = require("bullmq");

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

const mediaQueue = new Queue("media-processing", {
  connection,
  settings: {
    skipCheckRedisVersion: true,
  },
});

module.exports = { mediaQueue, connection };
