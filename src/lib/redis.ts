import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ compatibility
    enableReadyCheck: false,
    lazyConnect: true,
  });
}

/**
 * Singleton Redis client for rate-limiting, OTP storage, idempotency locks, and BullMQ.
 */
export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;
