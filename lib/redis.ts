import IORedis from "ioredis";

export const redis =
  global.__redis__ ??
  new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
  });

if (process.env.NODE_ENV !== "production") {
  global.__redis__ = redis;
}
