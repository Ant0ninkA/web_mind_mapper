import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { createUsersRouter } from './users';
import { InMemoryUserRepository } from '../repositories/InMemoryUserRepository';
import { signAuthToken } from '../auth/jwt';
import { AUTH_COOKIE_NAME } from '../auth/cookie';
import { hashPassword } from '../auth/passwords';

async function makeAppWithUser(): Promise<{
  app: express.Express;
  userId: string;
  repo: InMemoryUserRepository;
}> {
  const repo = new InMemoryUserRepository();
  const user = await repo.create({
    email: 'a@b.co',
    username: 'ivan',
    passwordHash: await hashPassword('oldpass12'),
  });
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/users', createUsersRouter(repo));
  return { app, userId: user.id, repo };
}

function cookie(userId: string): string {
  return `${AUTH_COOKIE_NAME}=${signAuthToken(userId)}`;
}

describe('GET /users/me', () => {
  it('returns 401 without cookie', async () => {
    const { app } = await makeAppWithUser();
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user (no passwordHash)', async () => {
    const { app, userId } = await makeAppWithUser();
    const res = await request(app).get('/users/me').set('Cookie', cookie(userId));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('a@b.co');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 401 if the token references a deleted user', async () => {
    const { app } = await makeAppWithUser();
    const res = await request(app).get('/users/me').set('Cookie', cookie('nonexistent-id'));
    expect(res.status).toBe(401);
  });
});
