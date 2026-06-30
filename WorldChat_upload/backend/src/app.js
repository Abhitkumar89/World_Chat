import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { env } from './config/env.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  // Security headers + gzip.
  app.use(helmet());
  app.use(compression());

  // CORS restricted to the configured client origin.
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (!env.isProd) app.use(morgan('dev'));

  // Rate limiting on the API surface.
  app.use('/api', globalLimiter);
  app.use('/api', routes);

  app.get('/', (_req, res) => res.json({ name: 'WorldChat API', status: 'running' }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
