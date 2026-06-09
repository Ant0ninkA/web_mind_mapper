import { Router, Request, Response } from 'express';
import { IUserRepository, DuplicateUserError } from '../repositories/IUserRepository';
import { requireAuth } from '../auth/middleware';
import { validatePatchProfile, validatePatchPassword } from '../validators/user';
import { hashPassword, verifyPassword } from '../auth/passwords';
import { signAuthToken } from '../auth/jwt';
import { setAuthCookie } from '../auth/cookie';
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

  router.patch('/me', async (req: Request, res: Response) => {
    const errs = validatePatchProfile(req.body ?? {});
    if (errs.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errs });
      return;
    }
    try {
      const user = await users.updateProfile(req.user!.id, {
        username: req.body.username,
        avatarUrl: req.body.avatarUrl,
      });
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      res.json({ user: toUserDto(user) });
    } catch (err) {
      if (err instanceof DuplicateUserError) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }
      throw err;
    }
  });

  router.patch('/me/password', async (req: Request, res: Response) => {
    const errs = validatePatchPassword(req.body ?? {});
    if (errs.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errs });
      return;
    }
    const user = await users.findById(req.user!.id);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const ok = await verifyPassword(req.body.oldPassword, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const newHash = await hashPassword(req.body.newPassword);
    await users.updatePasswordHash(user.id, newHash);
    setAuthCookie(res, signAuthToken(user.id));
    res.status(204).send();
  });

  return router;
}
