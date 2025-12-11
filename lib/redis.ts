import IORedis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redis__: IORedis | undefined;
}

// Compose a redis URL from piecewise env values if REDIS_URL is not provided.
const redisUrl =

  process.env.REDIS_URL ??
  (() => {
    // Prefer docker service name when no host is provided.
    const host = process.env.REDIS_HOST ?? "queue-redis";
    const port = process.env.REDIS_PORT ?? "6379";
    const db = process.env.REDIS_DB ?? "0";
    const password = process.env.REDIS_PASSWORD;
    const authPart = password ? `:${password}@` : "";
    return `redis://${authPart}${host}:${port}/${db}`;
  })();

if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
  // Help debug when env vars are missing and we fall back to localhost.
  console.warn(
    `[redis] REDIS_URL/REDIS_HOST not set. Falling back to ${redisUrl}. Set REDIS_URL=redis://:password@host:6379/0 for your environment.`
  );
}

const globalRedis = global as typeof global & {
  __redis__?: IORedis;
};

export const redis =
  globalRedis.__redis__ ??
  new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
  });

redis.on("error", (err: Error) => {
  console.error("[redis] connection error", err);
});

if (process.env.NODE_ENV !== "production") {
  globalRedis.__redis__ = redis;
}
