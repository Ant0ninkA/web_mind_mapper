import { v4 as uuidv4 } from 'uuid';
import { Mindmap, CreateMindmapDto, UpdateMindmapDto } from '../models/Mindmap';
import { IMindmapRepository } from './IMindmapRepository';

export class InMemoryMindmapRepository implements IMindmapRepository {
  private store = new Map<string, Mindmap>();

  async findAll(): Promise<Mindmap[]> {
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Mindmap | null> {
    return this.store.get(id) ?? null;
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
    this.store.set(mindmap.id, mindmap);
    return mindmap;
  }

  async update(id: string, dto: UpdateMindmapDto): Promise<Mindmap | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: Mindmap = {
      ...existing,
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.nodes !== undefined && { nodes: dto.nodes }),
      ...(dto.edges !== undefined && { edges: dto.edges }),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
