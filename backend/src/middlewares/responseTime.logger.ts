import { Request, Response, NextFunction } from "express";
const responseTimeLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`API: ${req.method} ${req.originalUrl} - ${duration}ms`.bgMagenta.bold);
  });

  next();
};

export default responseTimeLogger;
