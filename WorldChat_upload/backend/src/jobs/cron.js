import cron from 'node-cron';
import { expireImages } from '../services/imageExpiry.service.js';
import { logger } from '../utils/logger.js';

/**
 * Schedule the recurring jobs. Currently: expire temporary images every minute.
 * @param {import('socket.io').Server} io
 */
export const startCronJobs = (io) => {
  // Runs at the top of every minute.
  const task = cron.schedule('* * * * *', async () => {
    try {
      await expireImages(io);
    } catch (err) {
      logger.error('Image expiry cron failed', err);
    }
  });

  logger.info('Cron jobs started (image expiry: every minute)');
  return task;
};
