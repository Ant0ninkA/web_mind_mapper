import { Mindmap, CreateMindmapDto, UpdateMindmapDto } from '../models/Mindmap';

export interface IMindmapRepository {
  findAll(): Promise<Mindmap[]>;
  findById(id: string): Promise<Mindmap | null>;
  create(dto: CreateMindmapDto): Promise<Mindmap>;
  update(id: string, dto: UpdateMindmapDto): Promise<Mindmap | null>;
  delete(id: string): Promise<boolean>;
}
