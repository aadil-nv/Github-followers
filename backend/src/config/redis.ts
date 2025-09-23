// backend/src/config/redis.ts
import { createClient, RedisClientType } from 'redis';
import { config } from './env';
import { logger } from './logger';

let client: RedisClientType | null = null;

export async function connectRedis(): Promise<RedisClientType> {
  if (client) return client;
  client = createClient({ url: config.REDIS_URL });
  client.on('error', (err) => logger.error({ err }, 'Redis error'));
  client.on('connect', () => logger.info('Redis connecting...'));
  client.on('ready', () => logger.info('Redis ready'));
  await client.connect();
  return client;
}

export function getRedisClient(): RedisClientType {
  if (!client) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return client;
}
