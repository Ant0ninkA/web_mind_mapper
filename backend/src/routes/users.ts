import { Router, Request, Response } from 'express';
import { IUserRepository } from '../repositories/IUserRepository';
import { requireAuth } from '../auth/middleware';
import { toUserDto } from '../models/User';

export function createUsersRouter(users: IUserRepository): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/me', async (req: Request, res: Response) => {
    const user = await users.findById(req.user!.id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json({ user: toUserDto(user) });
  });

  return router;
}
