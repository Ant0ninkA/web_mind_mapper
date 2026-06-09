import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { createMindmapRouter } from './mindmaps';
import { InMemoryMindmapRepository } from '../repositories/InMemoryMindmapRepository';
import { InMemoryShareTokenRepository } from '../repositories/InMemoryShareTokenRepository';
import { signAuthToken } from '../auth/jwt';
import { AUTH_COOKIE_NAME } from '../auth/cookie';

function makeApp(repo: InMemoryMindmapRepository, shareRepo: InMemoryShareTokenRepository) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/mindmaps', createMindmapRouter(repo, shareRepo));
  return app;
}

function authCookie(userId: string): string {
  return `${AUTH_COOKIE_NAME}=${signAuthToken(userId)}`;
}

describe('mindmap routes (auth)', () => {
  let repo: InMemoryMindmapRepository;
  let shareRepo: InMemoryShareTokenRepository;
  let app: express.Express;

  beforeEach(() => {
    repo = new InMemoryMindmapRepository();
    shareRepo = new InMemoryShareTokenRepository();
    app = makeApp(repo, shareRepo);
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

  describe('POST /mindmaps/:id/share', () => {
    it('returns 401 without auth', async () => {
      const m = await repo.create({ name: 'mine' }, 'user-A');
      const res = await request(app).post(`/mindmaps/${m.id}/share`);
      expect(res.status).toBe(401);
    });

    it("returns 404 for another user's mindmap", async () => {
      const m = await repo.create({ name: 'theirs' }, 'user-B');
      const res = await request(app)
        .post(`/mindmaps/${m.id}/share`)
        .set('Cookie', authCookie('user-A'));
      expect(res.status).toBe(404);
    });

    it('returns 404 for nonexistent mindmap', async () => {
      const res = await request(app)
        .post('/mindmaps/nonexistent/share')
        .set('Cookie', authCookie('user-A'));
      expect(res.status).toBe(404);
    });

    it('creates a share token and returns shareUrl', async () => {
      const m = await repo.create({ name: 'mine' }, 'user-A');
      const res = await request(app)
        .post(`/mindmaps/${m.id}/share`)
        .set('Cookie', authCookie('user-A'));
      expect(res.status).toBe(201);
      expect(res.body.shareUrl).toMatch(/^\/shared\/[0-9a-f-]{36}$/);
    });

    it('is idempotent — returns same token on second call with 200', async () => {
      const m = await repo.create({ name: 'mine' }, 'user-A');
      const first = await request(app)
        .post(`/mindmaps/${m.id}/share`)
        .set('Cookie', authCookie('user-A'));
      const second = await request(app)
        .post(`/mindmaps/${m.id}/share`)
        .set('Cookie', authCookie('user-A'));
      expect(second.status).toBe(200);
      expect(second.body.shareUrl).toBe(first.body.shareUrl);
    });
  });
});
