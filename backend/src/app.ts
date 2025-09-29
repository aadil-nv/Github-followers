import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import 'colors';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import rootRoute from './routes/root.route';
import healthRoute from './routes/health.route';
import userRoute from './routes/user.routes';
import { HttpStatusCode } from './constants/http-status-code.enum';
import responseTimeLogger from './middlewares/responseTime.logger';
import { corsOptions } from './config/cors.config';

export function createApp(): Application {
  const app: Application = express();

  // Security & CORS
  app.use(helmet());
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // handle preflight requests

  // Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(responseTimeLogger);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(HttpStatusCode.TOO_MANY_REQUESTS).json({ message: 'Too many requests' });
    },
  });
  app.use(limiter);

  // Routes
  app.use('/', rootRoute);
  app.use('/health', healthRoute);
  app.use('/users', userRoute);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
