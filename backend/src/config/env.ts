import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGO_URI: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;
  ACCESS_TOKEN_MAX_AGE: string;     
  REFRESH_TOKEN_MAX_AGE : string;  
}

function parseNumber(value: string | undefined, name: string): number {
  if (!value) throw new Error(`Missing env var ${name}`);
  const num = Number(value);
  if (Number.isNaN(num)) throw new Error(`Invalid number for env var ${name}`);
  return num;
}

function getEnv(): EnvConfig {
  const {
    NODE_ENV,
    PORT,
    MONGO_URI,
    REDIS_URL,
    JWT_SECRET,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    ACCESS_TOKEN_MAX_AGE,
    REFRESH_TOKEN_MAX_AGE
  } = process.env;

  if (!NODE_ENV) throw new Error('NODE_ENV is required');
  if (!MONGO_URI) throw new Error('MONGO_URI is required');
  if (!REDIS_URL) throw new Error('REDIS_URL is required');
  if (!JWT_SECRET) throw new Error('JWT_SECRET is required');
  if (!RATE_LIMIT_WINDOW_MS) throw new Error('RATE_LIMIT_WINDOW_MS is required');
  if (!RATE_LIMIT_MAX) throw new Error('RATE_LIMIT_MAX is required');
  if (!PORT) throw new Error('PORT is required');
  if (!ACCESS_TOKEN_SECRET) throw new Error('ACCESS_TOKEN_SECRET is required');
  if (!REFRESH_TOKEN_SECRET) throw new Error('REFRESH_TOKEN_SECRET is required');
  if (!ACCESS_TOKEN_EXPIRY) throw new Error('ACCESS_TOKEN_EXPIRY is required');
  if (!REFRESH_TOKEN_EXPIRY) throw new Error('REFRESH_TOKEN_EXPIRY is required');
  if (!ACCESS_TOKEN_MAX_AGE) throw new Error('ACCESS_TOKEN_MAX_AGE is required');
  if (!REFRESH_TOKEN_MAX_AGE) throw new Error('REFRESH_TOKEN_MAX_AGE is required');



  return {
    NODE_ENV: NODE_ENV === 'production' ? 'production' : NODE_ENV === 'test' ? 'test' : 'development',
    PORT: parseNumber(PORT, 'PORT'),
    MONGO_URI,
    REDIS_URL,
    JWT_SECRET,
    RATE_LIMIT_WINDOW_MS: parseNumber(RATE_LIMIT_WINDOW_MS ?? '60000', 'RATE_LIMIT_WINDOW_MS'),
    RATE_LIMIT_MAX: parseNumber(RATE_LIMIT_MAX ?? '1000', 'RATE_LIMIT_MAX'),
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    ACCESS_TOKEN_MAX_AGE,
    REFRESH_TOKEN_MAX_AGE

  };
}

export const config = getEnv();
