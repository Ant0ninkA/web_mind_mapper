import express from 'express';
import request from 'supertest';
import { createSharedRouter } from './shared';
import { InMemoryShareTokenRepository } from '../repositories/InMemoryShareTokenRepository';
import { InMemoryMindmapRepository } from '../repositories/InMemoryMindmapRepository';

function makeApp(
  shareRepo: InMemoryShareTokenRepository,
  mindmapRepo: InMemoryMindmapRepository,
) {
  const app = express();
  app.use(express.json());
  app.use('/shared', createSharedRouter(shareRepo, mindmapRepo));
  return app;
}

describe('GET /shared/:token', () => {
  let shareRepo: InMemoryShareTokenRepository;
  let mindmapRepo: InMemoryMindmapRepository;
  let app: express.Express;

  beforeEach(() => {
    shareRepo = new InMemoryShareTokenRepository();
    mindmapRepo = new InMemoryMindmapRepository();
    app = makeApp(shareRepo, mindmapRepo);
  });

  it('returns 404 for unknown token', async () => {
    const res = await request(app).get('/shared/nonexistent-token');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Share link not found');
  });

  it('returns the mindmap for a valid token', async () => {
    const mindmap = await mindmapRepo.create({ name: 'my map' }, 'user-A');
    const shareToken = await shareRepo.create({ mindmapId: mindmap.id });
    const res = await request(app).get(`/shared/${shareToken.token}`);
    expect(res.status).toBe(200);
    expect(res.body.mindmap.id).toBe(mindmap.id);
    expect(res.body.mindmap.name).toBe('my map');
  });

  it('does not include ownerId in the response', async () => {
    const mindmap = await mindmapRepo.create({ name: 'my map' }, 'user-A');
    const shareToken = await shareRepo.create({ mindmapId: mindmap.id });
    const res = await request(app).get(`/shared/${shareToken.token}`);
    expect(res.body.mindmap.ownerId).toBeUndefined();
  });

  it('returns 404 if the mindmap was deleted after share token was created', async () => {
    const shareToken = await shareRepo.create({ mindmapId: 'deleted-map' });
    const res = await request(app).get(`/shared/${shareToken.token}`);
    expect(res.status).toBe(404);
  });

  it('requires no authentication', async () => {
    const mindmap = await mindmapRepo.create({ name: 'my map' }, 'user-A');
    const shareToken = await shareRepo.create({ mindmapId: mindmap.id });
    const res = await request(app).get(`/shared/${shareToken.token}`);
    expect(res.status).toBe(200);
  });
});
