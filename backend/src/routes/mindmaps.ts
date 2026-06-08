import { Router, Request, Response } from 'express';
import { IMindmapRepository } from '../repositories/IMindmapRepository';

interface ValidationError {
  field: string;
  message: string;
}

function validateName(name: unknown, required: boolean): ValidationError | null {
  if (required && (name === undefined || name === null)) {
    return { field: 'name', message: 'name is required' };
  }
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return { field: 'name', message: 'name must be a non-empty string' };
  }
  if (typeof name === 'string' && name.length > 200) {
    return { field: 'name', message: 'name must be 200 characters or less' };
  }
  return null;
}

function validateNodes(nodes: unknown): ValidationError | null {
  if (nodes === undefined) return null;
  if (!Array.isArray(nodes)) {
    return { field: 'nodes', message: 'nodes must be an array' };
  }
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node.id || typeof node.id !== 'string') {
      return { field: `nodes[${i}].id`, message: 'each node must have a string id' };
    }
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      return { field: `nodes[${i}].position`, message: 'each node must have position with x and y numbers' };
    }
    if (!node.data || typeof node.data.label !== 'string') {
      return { field: `nodes[${i}].data.label`, message: 'each node must have data.label as string' };
    }
  }
  return null;
}

function validateEdges(edges: unknown): ValidationError | null {
  if (edges === undefined) return null;
  if (!Array.isArray(edges)) {
    return { field: 'edges', message: 'edges must be an array' };
  }
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (!edge.id || typeof edge.id !== 'string') {
      return { field: `edges[${i}].id`, message: 'each edge must have a string id' };
    }
    if (!edge.source || typeof edge.source !== 'string') {
      return { field: `edges[${i}].source`, message: 'each edge must have a string source' };
    }
    if (!edge.target || typeof edge.target !== 'string') {
      return { field: `edges[${i}].target`, message: 'each edge must have a string target' };
    }
  }
  return null;
}

function validateMindmapInput(body: unknown, requireName: boolean): ValidationError | null {
  if (typeof body !== 'object' || body === null) {
    return { field: 'body', message: 'request body must be an object' };
  }
  const { name, nodes, edges } = body as Record<string, unknown>;
  return validateName(name, requireName) || validateNodes(nodes) || validateEdges(edges);
}

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
    const validationError = validateMindmapInput(req.body, true);
    if (validationError) {
      res.status(400).json({ error: validationError.message, field: validationError.field });
      return;
    }
    const { name, nodes, edges } = req.body;
    const mindmap = await repo.create({ name, nodes, edges });
    res.status(201).json(mindmap);
  });

  router.put('/:id', async (req: Request, res: Response) => {
    const validationError = validateMindmapInput(req.body, false);
    if (validationError) {
      res.status(400).json({ error: validationError.message, field: validationError.field });
      return;
    }
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
