import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

async function testRedis() {
  const client = createClient({ url: process.env.REDIS_URL });

  client.on('error', (err) => console.error('Redis Client Error', err));

  await client.connect();
  console.log('Connected to Redis');

  const pong = await client.ping();
  console.log('Ping response:', pong);

  await client.disconnect();
}

testRedis();
