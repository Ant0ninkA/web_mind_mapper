import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from './jwt';
import { AUTH_COOKIE_NAME } from './cookie';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const { sub } = verifyAuthToken(token);
    req.user = { id: sub };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
