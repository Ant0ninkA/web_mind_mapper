import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { createAuthRouter } from './auth';
import { InMemoryUserRepository } from '../repositories/InMemoryUserRepository';
import { AUTH_COOKIE_NAME } from '../auth/cookie';

function makeApp(repo: InMemoryUserRepository) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth', createAuthRouter(repo));
  return app;
}

function authCookieFromHeaders(headers: Record<string, unknown>): string | null {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie as string];
  const c = arr.find((s) => s.startsWith(`${AUTH_COOKIE_NAME}=`));
  return c ?? null;
}

describe('POST /auth/register', () => {
  it('creates a user, sets auth cookie, returns user dto', async () => {
    const repo = new InMemoryUserRepository();
    const res = await request(makeApp(repo))
      .post('/auth/register')
      .send({ email: 'a@b.co', username: 'ivan', password: 'supersecret' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('a@b.co');
    expect(res.body.user.username).toBe('ivan');
    expect(res.body.user.passwordHash).toBeUndefined();
    const cookie = authCookieFromHeaders(res.headers);
    expect(cookie).toBeTruthy();
    expect(cookie).toContain('HttpOnly');
  });

  it('returns 400 on validation failure', async () => {
    const res = await request(makeApp(new InMemoryUserRepository()))
      .post('/auth/register')
      .send({ email: 'bad', username: 'x', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('returns 409 on duplicate email', async () => {
    const repo = new InMemoryUserRepository();
    const app = makeApp(repo);
    await request(app).post('/auth/register').send({ email: 'a@b.co', username: 'ivan', password: 'supersecret' });
    const res = await request(app).post('/auth/register').send({ email: 'a@b.co', username: 'maria', password: 'supersecret' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already registered');
  });

  it('returns 409 on duplicate username', async () => {
    const repo = new InMemoryUserRepository();
    const app = makeApp(repo);
    await request(app).post('/auth/register').send({ email: 'a@b.co', username: 'ivan', password: 'supersecret' });
    const res = await request(app).post('/auth/register').send({ email: 'c@d.co', username: 'ivan', password: 'supersecret' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Username already taken');
  });
});

describe('POST /auth/login', () => {
  async function withRegisteredUser() {
    const repo = new InMemoryUserRepository();
    const app = makeApp(repo);
    await request(app).post('/auth/register').send({ email: 'a@b.co', username: 'ivan', password: 'supersecret' });
    return { repo, app };
  }

  it('logs in with correct credentials', async () => {
    const { app } = await withRegisteredUser();
    const res = await request(app).post('/auth/login').send({ email: 'a@b.co', password: 'supersecret' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('a@b.co');
    expect(authCookieFromHeaders(res.headers)).toBeTruthy();
  });

  it('is case-insensitive on email', async () => {
    const { app } = await withRegisteredUser();
    const res = await request(app).post('/auth/login').send({ email: 'A@B.CO', password: 'supersecret' });
    expect(res.status).toBe(200);
  });

  it('returns 401 on wrong password', async () => {
    const { app } = await withRegisteredUser();
    const res = await request(app).post('/auth/login').send({ email: 'a@b.co', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 401 on unknown email', async () => {
    const { app } = await withRegisteredUser();
    const res = await request(app).post('/auth/login').send({ email: 'nope@nope.co', password: 'whatever' });
    expect(res.status).toBe(401);
  });

  it('returns 400 on missing fields', async () => {
    const { app } = await withRegisteredUser();
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/logout', () => {
  it('returns 204 and clears the auth cookie', async () => {
    const res = await request(makeApp(new InMemoryUserRepository())).post('/auth/logout');
    expect(res.status).toBe(204);
    const cookie = authCookieFromHeaders(res.headers);
    expect(cookie).toBeTruthy();
    expect(cookie).toMatch(/Max-Age=0|Expires=/i);
  });
});
