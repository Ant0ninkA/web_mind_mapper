import { Router, Request, Response } from 'express';
import { IUserRepository, DuplicateUserError } from '../repositories/IUserRepository';
import { hashPassword, verifyPassword } from '../auth/passwords';
import { signAuthToken } from '../auth/jwt';
import { setAuthCookie, clearAuthCookie } from '../auth/cookie';
import { validateRegister, validateLogin } from '../validators/user';
import { toUserDto } from '../models/User';

export function createAuthRouter(users: IUserRepository): Router {
  const router = Router();

  router.post('/register', async (req: Request, res: Response) => {
    const errs = validateRegister(req.body ?? {});
    if (errs.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errs });
      return;
    }
    const { email, username, password } = req.body;
    const passwordHash = await hashPassword(password);
    try {
      const user = await users.create({ email, username, passwordHash });
      setAuthCookie(res, signAuthToken(user.id));
      res.status(201).json({ user: toUserDto(user) });
    } catch (err) {
      if (err instanceof DuplicateUserError) {
        const msg = err.field === 'email' ? 'Email already registered' : 'Username already taken';
        res.status(409).json({ error: msg });
        return;
      }
      throw err;
    }
  });

  router.post('/login', async (req: Request, res: Response) => {
    const errs = validateLogin(req.body ?? {});
    if (errs.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errs });
      return;
    }
    const { email, password } = req.body;
    const user = await users.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    setAuthCookie(res, signAuthToken(user.id));
    res.json({ user: toUserDto(user) });
  });

  router.post('/logout', (_req: Request, res: Response) => {
    clearAuthCookie(res);
    res.status(204).send();
  });

  return router;
}
