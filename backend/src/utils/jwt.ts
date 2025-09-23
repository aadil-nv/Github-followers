import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AccessTokenPayload } from '../interfaces/jwt.interface';

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRY,
  } as SignOptions);
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.REFRESH_TOKEN_SECRET) as AccessTokenPayload;
}
