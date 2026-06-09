import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { requireAuth } from './middleware';
import { signAuthToken } from './jwt';
import { AUTH_COOKIE_NAME } from './cookie';

function makeApp() {
  const app = express();
  app.use(cookieParser());
  app.get('/protected', requireAuth, (req, res) => {
    res.json({ userId: req.user!.id });
  });
  return app;
}

describe('requireAuth', () => {
  it('returns 401 when no cookie is sent', async () => {
    const res = await request(makeApp()).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 when cookie is invalid', async () => {
    const res = await request(makeApp())
      .get('/protected')
      .set('Cookie', `${AUTH_COOKIE_NAME}=garbage`);
    expect(res.status).toBe(401);
  });

  it('passes through and exposes req.user.id when cookie is valid', async () => {
    const token = signAuthToken('user-42');
    const res = await request(makeApp())
      .get('/protected')
      .set('Cookie', `${AUTH_COOKIE_NAME}=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: 'user-42' });
  });
});
