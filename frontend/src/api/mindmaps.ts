
import { api } from './client';
import type {
  Mindmap,
  CreateMindmapDto,
  UpdateMindmapDto,
} from './types';

/** `GET /mindmaps` — list every mindmap. */
export function listMindmaps(): Promise<Mindmap[]> {
  return api.get<Mindmap[]>('/mindmaps');
}

/** `GET /mindmaps/:id` — fetch one mindmap with its full graph. */
export function getMindmap(id: string): Promise<Mindmap> {
  return api.get<Mindmap>(`/mindmaps/${id}`);
}

/** `POST /mindmaps` — create a mindmap. `name` is required. */
export function createMindmap(dto: CreateMindmapDto): Promise<Mindmap> {
  return api.post<Mindmap>('/mindmaps', dto);
}

/**
 * `PUT /mindmaps/:id` — full replace
 */
export function updateMindmap(
  id: string,
  dto: UpdateMindmapDto
): Promise<Mindmap> {
  return api.put<Mindmap>(`/mindmaps/${id}`, dto);
}

/** `DELETE /mindmaps/:id` */
export function deleteMindmap(id: string): Promise<void> {
  return api.del<void>(`/mindmaps/${id}`);
}
