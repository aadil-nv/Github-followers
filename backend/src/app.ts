import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import 'colors';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import rootRoute from './routes/root.route';
import healthRoute from './routes/health.route';
import userRoute from './routes/user.routes';
import { HttpStatusCode } from './constants/http-status-code.enum';
import authRoute from './routes/auth.route';
import responseTimeLogger from "./middlewares/responseTime.logger";


const swaggerDocument = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));

export function createApp(): Application {
  const app: Application = express();

  app.use(helmet());
  app.use(cors());

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(responseTimeLogger);


  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS, 
    max: config.RATE_LIMIT_MAX, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response, _next: NextFunction, _options) => {
      res.status(HttpStatusCode.TOO_MANY_REQUESTS).json({ message: 'Too many requests' });
    },
  });
  app.use(limiter);

  // API Docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

  // Routes
  app.use('/', rootRoute);
  app.use('/health', healthRoute);
  app.use('/users', userRoute);
  app.use('/auth', authRoute);



  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
