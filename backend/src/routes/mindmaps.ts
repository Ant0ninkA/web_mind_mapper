import { Router, Request, Response } from 'express';
import { IMindmapRepository } from '../repositories/IMindmapRepository';

export function createMindmapRouter(repo: IMindmapRepository): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    const mindmaps = await repo.findAll();
    res.json(mindmaps);
  });

  router.get('/:id', async (req: Request, res: Response) => {
    const mindmap = await repo.findById(req.params.id);
    if (!mindmap) {
      res.status(404).json({ error: 'Mindmap not found' });
      return;
    }
    res.json(mindmap);
  });

  router.post('/', async (req: Request, res: Response) => {
    const { name, nodes, edges } = req.body;
    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const mindmap = await repo.create({ name, nodes, edges });
    res.status(201).json(mindmap);
  });

  router.put('/:id', async (req: Request, res: Response) => {
    const { name, nodes, edges } = req.body;
    const updated = await repo.update(req.params.id, { name, nodes, edges });
    if (!updated) {
      res.status(404).json({ error: 'Mindmap not found' });
      return;
    }
    res.json(updated);
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    const deleted = await repo.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Mindmap not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}
