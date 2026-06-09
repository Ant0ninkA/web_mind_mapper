import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { MongoShareTokenRepository } from './MongoShareTokenRepository';

describe('MongoShareTokenRepository', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let repo: MongoShareTokenRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    db = client.db('test');
    await db.createCollection('share_tokens');
    await db.collection('share_tokens').createIndex({ token: 1 }, { unique: true });
    await db.collection('share_tokens').createIndex({ mindmapId: 1 }, { unique: true });
    repo = new MongoShareTokenRepository(db);
  }, 60000);

  afterAll(async () => {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await db.collection('share_tokens').deleteMany({});
  });

  describe('create', () => {
    it('creates a share token with a UUID token string', async () => {
      const st = await repo.create({ mindmapId: 'map-1' });
      expect(st.token).toMatch(/^[0-9a-f-]{36}$/);
      expect(st.mindmapId).toBe('map-1');
      expect(st.createdAt).toBeInstanceOf(Date);
    });

    it('generates unique tokens for different mindmaps', async () => {
      const a = await repo.create({ mindmapId: 'map-1' });
      const b = await repo.create({ mindmapId: 'map-2' });
      expect(a.token).not.toBe(b.token);
    });
  });

  describe('findByToken', () => {
    it('finds an existing token', async () => {
      const created = await repo.create({ mindmapId: 'map-1' });
      const found = await repo.findByToken(created.token);
      expect(found?.mindmapId).toBe('map-1');
    });

    it('returns null when not found', async () => {
      expect(await repo.findByToken('nope')).toBeNull();
    });
  });

  describe('findByMindmapId', () => {
    it('finds an existing token by mindmap id', async () => {
      const created = await repo.create({ mindmapId: 'map-1' });
      const found = await repo.findByMindmapId('map-1');
      expect(found?.token).toBe(created.token);
    });

    it('returns null when not found', async () => {
      expect(await repo.findByMindmapId('nope')).toBeNull();
    });
  });

  describe('uniqueness constraints', () => {
    it('rejects duplicate mindmapId (one share link per mindmap)', async () => {
      await repo.create({ mindmapId: 'map-1' });
      await expect(repo.create({ mindmapId: 'map-1' })).rejects.toThrow();
    });

    it('allows different mindmaps to each have a share token', async () => {
      const t1 = await repo.create({ mindmapId: 'map-1' });
      const t2 = await repo.create({ mindmapId: 'map-2' });
      expect(t1.token).not.toBe(t2.token);
      expect(t1.mindmapId).toBe('map-1');
      expect(t2.mindmapId).toBe('map-2');
    });
  });

  describe('token format', () => {
    it('generates a valid UUID v4 token', async () => {
      const st = await repo.create({ mindmapId: 'map-1' });
      expect(st.token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  describe('createdAt', () => {
    it('sets createdAt close to current time', async () => {
      const before = new Date();
      const st = await repo.create({ mindmapId: 'map-1' });
      const after = new Date();
      expect(st.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(st.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('data integrity', () => {
    it('findByToken returns same data as findByMindmapId', async () => {
      const created = await repo.create({ mindmapId: 'map-1' });
      const byToken = await repo.findByToken(created.token);
      const byMindmap = await repo.findByMindmapId('map-1');
      expect(byToken?.token).toBe(byMindmap?.token);
      expect(byToken?.mindmapId).toBe(byMindmap?.mindmapId);
      expect(byToken?.createdAt.getTime()).toBe(byMindmap?.createdAt.getTime());
    });

    it('multiple tokens do not interfere with each other', async () => {
      await repo.create({ mindmapId: 'map-1' });
      await repo.create({ mindmapId: 'map-2' });
      await repo.create({ mindmapId: 'map-3' });

      const found = await repo.findByMindmapId('map-2');
      expect(found?.mindmapId).toBe('map-2');

      expect(await repo.findByMindmapId('map-4')).toBeNull();
    });
  });
});
