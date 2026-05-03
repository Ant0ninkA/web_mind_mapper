import { v4 as uuidv4 } from 'uuid';
import { Db } from 'mongodb';
import { Mindmap, CreateMindmapDto, UpdateMindmapDto } from '../models/Mindmap';
import { IMindmapRepository } from './IMindmapRepository';

const COLLECTION = 'mindmaps';

export class MongoMindmapRepository implements IMindmapRepository {
  constructor(private readonly db: Db) {}

  async findAll(): Promise<Mindmap[]> {
    return this.db.collection<Mindmap>(COLLECTION).find({}).toArray();
  }

  async findById(id: string): Promise<Mindmap | null> {
    return this.db.collection<Mindmap>(COLLECTION).findOne({ id }) ?? null;
  }

  async create(dto: CreateMindmapDto): Promise<Mindmap> {
    const now = new Date();
    const mindmap: Mindmap = {
      id: uuidv4(),
      name: dto.name,
      nodes: dto.nodes ?? [],
      edges: dto.edges ?? [],
      createdAt: now,
      updatedAt: now,
    };
    await this.db.collection<Mindmap>(COLLECTION).insertOne(mindmap);
    return mindmap;
  }

  async update(id: string, dto: UpdateMindmapDto): Promise<Mindmap | null> {
    const updateFields: Partial<Mindmap> = { updatedAt: new Date() };
    if (dto.name !== undefined) updateFields.name = dto.name;
    if (dto.nodes !== undefined) updateFields.nodes = dto.nodes;
    if (dto.edges !== undefined) updateFields.edges = dto.edges;

    const result = await this.db
      .collection<Mindmap>(COLLECTION)
      .findOneAndUpdate({ id }, { $set: updateFields }, { returnDocument: 'after' });
    return result ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.collection<Mindmap>(COLLECTION).deleteOne({ id });
    return result.deletedCount === 1;
  }
}
