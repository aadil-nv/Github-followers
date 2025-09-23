// backend/src/routes/root.route.ts
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.type('text/plain').send('LedgerLink API is running');
});

export default router;
