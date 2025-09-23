import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

export async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(config.MONGO_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection error');
    throw err;
  }
}
