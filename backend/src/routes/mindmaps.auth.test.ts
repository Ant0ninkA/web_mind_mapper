import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { createMindmapRouter } from './mindmaps';
import { InMemoryMindmapRepository } from '../repositories/InMemoryMindmapRepository';
import { signAuthToken } from '../auth/jwt';
import { AUTH_COOKIE_NAME } from '../auth/cookie';

function makeApp(repo: InMemoryMindmapRepository) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/mindmaps', createMindmapRouter(repo));
  return app;
}

function authCookie(userId: string): string {
  return `${AUTH_COOKIE_NAME}=${signAuthToken(userId)}`;
}

describe('mindmap routes (auth)', () => {
  let repo: InMemoryMindmapRepository;
  let app: express.Express;

  beforeEach(() => {
    repo = new InMemoryMindmapRepository();
    app = makeApp(repo);
  });

  it('GET /mindmaps returns 401 without auth', async () => {
    const res = await request(app).get('/mindmaps');
    expect(res.status).toBe(401);
  });

  it('GET /mindmaps lists only the caller\'s mindmaps', async () => {
    await repo.create({ name: 'mine' }, 'user-A');
    await repo.create({ name: 'theirs' }, 'user-B');
    const res = await request(app).get('/mindmaps').set('Cookie', authCookie('user-A'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('mine');
  });

  it('POST /mindmaps stamps ownerId from the token, ignoring client value', async () => {
    const res = await request(app)
      .post('/mindmaps')
      .set('Cookie', authCookie('user-A'))
      .send({ name: 'new', ownerId: 'user-B' });
    expect(res.status).toBe(201);
    expect(res.body.ownerId).toBe('user-A');
  });

  it('GET /mindmaps/:id returns 404 for another user\'s mindmap', async () => {
    const m = await repo.create({ name: 'theirs' }, 'user-B');
    const res = await request(app).get(`/mindmaps/${m.id}`).set('Cookie', authCookie('user-A'));
    expect(res.status).toBe(404);
  });

  it('PUT /mindmaps/:id returns 404 for another user\'s mindmap', async () => {
    const m = await repo.create({ name: 'theirs' }, 'user-B');
    const res = await request(app)
      .put(`/mindmaps/${m.id}`)
      .set('Cookie', authCookie('user-A'))
      .send({ name: 'hijack' });
    expect(res.status).toBe(404);
  });

  it('DELETE /mindmaps/:id returns 404 for another user\'s mindmap', async () => {
    const m = await repo.create({ name: 'theirs' }, 'user-B');
    const res = await request(app)
      .delete(`/mindmaps/${m.id}`)
      .set('Cookie', authCookie('user-A'));
    expect(res.status).toBe(404);
  });

  it('POST /mindmaps returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/mindmaps')
      .set('Cookie', authCookie('user-A'))
      .send({});
    expect(res.status).toBe(400);
  });
});
