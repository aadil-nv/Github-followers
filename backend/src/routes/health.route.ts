// backend/src/routes/health.route.ts
import { Router, Request, Response } from 'express';
import { HttpStatusCode } from '../constants/http-status-code.enum';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(HttpStatusCode.OK).json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
