"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Compose a redis URL from piecewise env values if REDIS_URL is not provided.
const redisUrl = (_a = process.env.REDIS_URL) !== null && _a !== void 0 ? _a : (() => {
    var _a, _b, _c;
    // Prefer docker service name when no host is provided.
    const host = (_a = process.env.REDIS_HOST) !== null && _a !== void 0 ? _a : "queue-redis";
    const port = (_b = process.env.REDIS_PORT) !== null && _b !== void 0 ? _b : "6379";
    const db = (_c = process.env.REDIS_DB) !== null && _c !== void 0 ? _c : "0";
    const password = process.env.REDIS_PASSWORD;
    const authPart = password ? `:${password}@` : "";
    return `redis://${authPart}${host}:${port}/${db}`;
})();
if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    // Help debug when env vars are missing and we fall back to localhost.
    console.warn(`[redis] REDIS_URL/REDIS_HOST not set. Falling back to ${redisUrl}. Set REDIS_URL=redis://:password@host:6379/0 for your environment.`);
}
const globalRedis = global;
exports.redis = (_b = globalRedis.__redis__) !== null && _b !== void 0 ? _b : new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
});
exports.redis.on("error", (err) => {
    console.error("[redis] connection error", err);
});
if (process.env.NODE_ENV !== "production") {
    globalRedis.__redis__ = exports.redis;
}
