import { api } from './client';
import type { Mindmap } from './types';

export function createShareLink(mindmapId: string): Promise<{ shareUrl: string }> {
  return api.post<{ shareUrl: string }>(`/mindmaps/${mindmapId}/share`);
}

export function getSharedMindmap(token: string): Promise<{ mindmap: Mindmap }> {
  return api.get<{ mindmap: Mindmap }>(`/shared/${token}`);
}
