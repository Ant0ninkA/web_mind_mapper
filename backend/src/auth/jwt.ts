import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthPayload {
  sub: string;
  iat: number;
  exp: number;
}

export function signAuthToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: `${config.jwtTtlHours}h`,
  });
}

export function verifyAuthToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token payload');
  }
  return decoded as AuthPayload;
}
