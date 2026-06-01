import Redis from "ioredis";

const PLACEHOLDER_PATTERNS = [
  "SEU_TOKEN",
  "PASSWORD",
  "xxxx.upstash",
  "USER:PASSWORD",
];

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export function isRedisConfigured() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return false;
  return !PLACEHOLDER_PATTERNS.some((p) => url.includes(p));
}

export function createRedisClient() {
  if (!isRedisConfigured()) return null;

  const url = process.env.REDIS_URL!;
  const isTls = url.startsWith("rediss://");

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 500, 2000)),
    ...(isTls ? { tls: {} } : {}),
  });

  client.on("error", () => {
    // Evita spam de "Unhandled error event" no terminal
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production" && redis) {
  globalForRedis.redis = redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // Redis optional
  }
}

export async function publishEvent(channel: string, payload: unknown) {
  if (!redis) return;
  try {
    await redis.publish(channel, JSON.stringify(payload));
  } catch {
    // Redis optional
  }
}
