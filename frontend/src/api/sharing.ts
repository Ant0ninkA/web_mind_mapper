import { api } from './client';
import type { Mindmap } from './types';

/**
 * `POST /mindmaps/:id/share` — create (or fetch the existing) read-only share
 * link for a mindmap the caller owns. Returns a root-relative `shareUrl` like
 * `/shared/<token>`; callers prepend `window.location.origin` for a full URL.
 */
export function createShareLink(mindmapId: string): Promise<{ shareUrl: string }> {
  return api.post<{ shareUrl: string }>(`/mindmaps/${mindmapId}/share`);
}

/**
 * `GET /shared/:token` — public, read-only fetch of a shared mindmap (no auth,
 * ownerId stripped by the backend). Throws ApiError 404 if the link is invalid.
 */
export function getSharedMindmap(token: string): Promise<{ mindmap: Mindmap }> {
  return api.get<{ mindmap: Mindmap }>(`/shared/${token}`);
}
