import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { MongoMindmapRepository } from './MongoMindmapRepository';

describe('MongoMindmapRepository', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let repository: MongoMindmapRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test');
    repository = new MongoMindmapRepository(db);
  }, 60000);

  afterAll(async () => {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await db.collection('mindmaps').deleteMany({});
  });

  describe('create', () => {
    it('should create a mindmap with required fields', async () => {
      const dto = {
        name: 'Test Mindmap',
        nodes: [{ id: 'n1', position: { x: 100, y: 100 }, data: { label: 'Node 1' } }],
        edges: [],
      };

      const result = await repository.create(dto);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Mindmap');
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a mindmap with empty nodes and edges if not provided', async () => {
      const dto = { name: 'Empty Mindmap' };

      const result = await repository.create(dto);

      expect(result.name).toBe('Empty Mindmap');
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should generate unique IDs for different mindmaps', async () => {
      const mindmap1 = await repository.create({ name: 'Mindmap 1' });
      const mindmap2 = await repository.create({ name: 'Mindmap 2' });

      expect(mindmap1.id).not.toBe(mindmap2.id);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no mindmaps exist', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should return all mindmaps', async () => {
      await repository.create({ name: 'Mindmap 1' });
      await repository.create({ name: 'Mindmap 2' });
      await repository.create({ name: 'Mindmap 3' });

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
      expect(result.map(m => m.name)).toContain('Mindmap 1');
      expect(result.map(m => m.name)).toContain('Mindmap 2');
      expect(result.map(m => m.name)).toContain('Mindmap 3');
    });
  });

  describe('findById', () => {
    it('should return null for non-existent ID', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return the mindmap with matching ID', async () => {
      const created = await repository.create({ name: 'Find Me' });

      const result = await repository.findById(created.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
      expect(result!.name).toBe('Find Me');
    });
  });

  describe('update', () => {
    it('should return null when updating non-existent mindmap', async () => {
      const result = await repository.update('non-existent-id', { name: 'New Name' });

      expect(result).toBeNull();
    });

    it('should update the name', async () => {
      const created = await repository.create({ name: 'Original Name' });

      const result = await repository.update(created.id, { name: 'Updated Name' });

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated Name');
    });

    it('should update nodes', async () => {
      const created = await repository.create({ name: 'Test', nodes: [] });
      const newNodes = [{ id: 'n1', position: { x: 50, y: 50 }, data: { label: 'New Node' } }];

      const result = await repository.update(created.id, { nodes: newNodes });

      expect(result!.nodes).toHaveLength(1);
      expect(result!.nodes[0].data.label).toBe('New Node');
    });

    it('should update edges', async () => {
      const created = await repository.create({
        name: 'Test',
        nodes: [
          { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'A' } },
          { id: 'n2', position: { x: 100, y: 0 }, data: { label: 'B' } },
        ],
        edges: [],
      });
      const newEdges = [{ id: 'e1', source: 'n1', target: 'n2' }];

      const result = await repository.update(created.id, { edges: newEdges });

      expect(result!.edges).toHaveLength(1);
      expect(result!.edges[0].source).toBe('n1');
      expect(result!.edges[0].target).toBe('n2');
    });

    it('should update updatedAt timestamp', async () => {
      const created = await repository.create({ name: 'Test' });
      const originalUpdatedAt = created.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await repository.update(created.id, { name: 'Updated' });

      expect(result!.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('delete', () => {
    it('should return false when deleting non-existent mindmap', async () => {
      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should return true and remove the mindmap', async () => {
      const created = await repository.create({ name: 'To Delete' });

      const deleteResult = await repository.delete(created.id);
      const findResult = await repository.findById(created.id);

      expect(deleteResult).toBe(true);
      expect(findResult).toBeNull();
    });

    it('should only delete the specified mindmap', async () => {
      const keep = await repository.create({ name: 'Keep' });
      const remove = await repository.create({ name: 'Remove' });

      await repository.delete(remove.id);
      const allMindmaps = await repository.findAll();

      expect(allMindmaps).toHaveLength(1);
      expect(allMindmaps[0].id).toBe(keep.id);
    });
  });
});
