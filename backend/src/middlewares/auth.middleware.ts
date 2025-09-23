import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { HttpStatusCode } from '../constants/http-status-code.enum';
import { AuthRequest } from '../interfaces/authRequest.interface';


export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(HttpStatusCode.UNAUTHORIZED).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}
