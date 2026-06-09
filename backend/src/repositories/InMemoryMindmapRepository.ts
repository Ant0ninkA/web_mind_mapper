import { v4 as uuidv4 } from 'uuid';
import { Mindmap, CreateMindmapDto, UpdateMindmapDto } from '../models/Mindmap';
import { IMindmapRepository } from './IMindmapRepository';

export class InMemoryMindmapRepository implements IMindmapRepository {
  private store = new Map<string, Mindmap>();

  async findAll(ownerId: string): Promise<Mindmap[]> {
    return Array.from(this.store.values()).filter((m) => m.ownerId === ownerId);
  }

  async findById(id: string, ownerId: string): Promise<Mindmap | null> {
    const m = this.store.get(id);
    return m && m.ownerId === ownerId ? m : null;
  }

  async findByIdPublic(id: string): Promise<Mindmap | null> {
    return this.store.get(id) ?? null;
  }

  async create(dto: CreateMindmapDto, ownerId: string): Promise<Mindmap> {
    const now = new Date();
    const mindmap: Mindmap = {
      id: uuidv4(),
      ownerId,
      name: dto.name,
      nodes: dto.nodes ?? [],
      edges: dto.edges ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(mindmap.id, mindmap);
    return mindmap;
  }

  async update(id: string, ownerId: string, dto: UpdateMindmapDto): Promise<Mindmap | null> {
    const existing = this.store.get(id);
    if (!existing || existing.ownerId !== ownerId) return null;
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

  async delete(id: string, ownerId: string): Promise<boolean> {
    const m = this.store.get(id);
    if (!m || m.ownerId !== ownerId) return false;
    return this.store.delete(id);
  }
}
