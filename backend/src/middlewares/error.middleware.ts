import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';
import { HttpStatusCode } from '../constants/http-status-code.enum';

export interface ApiError extends Error {
  status?: number;
  details?: unknown;
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(HttpStatusCode.NOT_FOUND).json({ message: 'Not Found' });
}

export function errorHandler(err: ApiError, req: Request, res: Response, _next: NextFunction): void {
  const status = err.status ?? HttpStatusCode.INTERNAL_SERVER_ERROR;
  const payload = {
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack, details: err.details } : {}),
  };
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');
  res.status(status).json(payload);
}
