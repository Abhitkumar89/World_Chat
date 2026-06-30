import http from 'http';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './socket/index.js';
import { startCronJobs } from './jobs/cron.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const start = async () => {
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = initSocket(httpServer);
  // Make io available to controllers (e.g. for broadcasting) if needed.
  app.set('io', io);

  startCronJobs(io);

  httpServer.listen(env.port, () => {
    logger.info(`WorldChat API listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    io.close();
    httpServer.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    // Force-exit if it hangs.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', reason));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err);
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
