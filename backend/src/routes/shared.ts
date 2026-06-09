import { Router, Request, Response } from 'express';
import { IShareTokenRepository } from '../repositories/IShareTokenRepository';
import { IMindmapRepository } from '../repositories/IMindmapRepository';
import { Mindmap } from '../models/Mindmap';

type MindmapDto = Omit<Mindmap, 'ownerId'>;

function toMindmapDto(mindmap: Mindmap): MindmapDto {
  const { ownerId, ...dto } = mindmap;
  return dto;
}

export function createSharedRouter(
  shareTokens: IShareTokenRepository,
  mindmaps: IMindmapRepository,
): Router {
  const router = Router();

  router.get('/:token', async (req: Request, res: Response) => {
    const shareToken = await shareTokens.findByToken(req.params.token);
    if (!shareToken) {
      res.status(404).json({ error: 'Share link not found' });
      return;
    }
    const mindmap = await mindmaps.findByIdPublic(shareToken.mindmapId);
    if (!mindmap) {
      res.status(404).json({ error: 'Share link not found' });
      return;
    }
    res.json({ mindmap: toMindmapDto(mindmap) });
  });

  return router;
}
