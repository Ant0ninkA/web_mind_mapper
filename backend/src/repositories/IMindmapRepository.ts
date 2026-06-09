import { Mindmap, CreateMindmapDto, UpdateMindmapDto } from '../models/Mindmap';

export interface IMindmapRepository {
  findAll(ownerId: string): Promise<Mindmap[]>;
  findById(id: string, ownerId: string): Promise<Mindmap | null>;
  findByIdPublic(id: string): Promise<Mindmap | null>;
  create(dto: CreateMindmapDto, ownerId: string): Promise<Mindmap>;
  update(id: string, ownerId: string, dto: UpdateMindmapDto): Promise<Mindmap | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
}
