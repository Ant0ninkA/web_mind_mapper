import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { MongoUserRepository } from './MongoUserRepository';
import { DuplicateUserError } from './IUserRepository';

describe('MongoUserRepository', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let repo: MongoUserRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    db = client.db('test');
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    repo = new MongoUserRepository(db);
  }, 60000);

  afterAll(async () => {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await db.collection('users').deleteMany({});
  });

  describe('create', () => {
    it('creates a user with required fields', async () => {
      const user = await repo.create({
        email: 'a@b.co',
        username: 'ivan',
        passwordHash: 'hashed',
      });
      expect(user.id).toBeDefined();
      expect(user.email).toBe('a@b.co');
      expect(user.username).toBe('ivan');
      expect(user.passwordHash).toBe('hashed');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('lowercases email', async () => {
      const user = await repo.create({ email: 'A@B.CO', username: 'ivan', passwordHash: 'h' });
      expect(user.email).toBe('a@b.co');
    });

    it('throws DuplicateUserError on duplicate email', async () => {
      await repo.create({ email: 'a@b.co', username: 'ivan', passwordHash: 'h' });
      await expect(
        repo.create({ email: 'a@b.co', username: 'other', passwordHash: 'h' }),
      ).rejects.toBeInstanceOf(DuplicateUserError);
    });

    it('throws DuplicateUserError on duplicate username', async () => {
      await repo.create({ email: 'a@b.co', username: 'ivan', passwordHash: 'h' });
      await expect(
        repo.create({ email: 'c@d.co', username: 'ivan', passwordHash: 'h' }),
      ).rejects.toBeInstanceOf(DuplicateUserError);
    });
  });

  describe('findByEmail', () => {
    it('finds case-insensitively', async () => {
      await repo.create({ email: 'a@b.co', username: 'ivan', passwordHash: 'h' });
      const found = await repo.findByEmail('A@B.CO');
      expect(found?.username).toBe('ivan');
    });

    it('returns null when not found', async () => {
      expect(await repo.findByEmail('nope@nope.co')).toBeNull();
    });
  });

  describe('findById', () => {
    it('finds an existing user', async () => {
      const created = await repo.create({ email: 'a@b.co', username: 'ivan', passwordHash: 'h' });
      const found = await repo.findById(created.id);
      expect(found?.email).toBe('a@b.co');
    });

    it('returns null when not found', async () => {
      expect(await repo.findById('nope')).toBeNull();
    });
  });

  describe('create - ID generation', () => {
    it('generates unique IDs for different users', async () => {
      const u1 = await repo.create({ email: 'a@b.co', username: 'user1', passwordHash: 'h' });
      const u2 = await repo.create({ email: 'c@d.co', username: 'user2', passwordHash: 'h' });
      expect(u1.id).not.toBe(u2.id);
    });

    it('generates valid UUID v4 format', async () => {
      const user = await repo.create({ email: 'a@b.co', username: 'ivan', passwordHash: 'h' });
      expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  describe('duplicate error classification', () => {
    it('reports field=email on email collision', async () => {
      await repo.create({ email: 'a@b.co', username: 'ivan', passwordHash: 'h' });
      try {
        await repo.create({ email: 'a@b.co', username: 'other', passwordHash: 'h' });
        fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(DuplicateUserError);
        expect((err as DuplicateUserError).field).toBe('email');
      }
    });

    it('reports field=username on username collision', async () => {
      await repo.create({ email: 'a@b.co', username: 'ivan', passwordHash: 'h' });
      try {
        await repo.create({ email: 'c@d.co', username: 'ivan', passwordHash: 'h' });
        fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(DuplicateUserError);
        expect((err as DuplicateUserError).field).toBe('username');
      }
    });
  });
});
