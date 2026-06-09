import { Response, CookieOptions } from 'express';
import { config, isProduction } from '../config';

export const AUTH_COOKIE_NAME = 'auth';

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...baseOptions(),
    maxAge: config.jwtTtlHours * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  res.cookie(AUTH_COOKIE_NAME, '', {
    ...baseOptions(),
    maxAge: 0,
  });
}
