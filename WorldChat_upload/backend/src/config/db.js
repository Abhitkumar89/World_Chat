import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB with sensible production defaults and retry logging.
 */
export const connectDB = async () => {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', err));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20,
    });
  } catch (err) {
    logger.error('Initial MongoDB connection failed', err);
    throw err;
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
};
