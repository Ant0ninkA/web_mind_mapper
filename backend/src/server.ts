import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { connectToMongo, assertUsersCollectionExists, assertShareTokensCollectionExists } from './db';
import { InMemoryMindmapRepository } from './repositories/InMemoryMindmapRepository';
import { MongoMindmapRepository } from './repositories/MongoMindmapRepository';
import { IMindmapRepository } from './repositories/IMindmapRepository';
import { InMemoryUserRepository } from './repositories/InMemoryUserRepository';
import { MongoUserRepository } from './repositories/MongoUserRepository';
import { IUserRepository } from './repositories/IUserRepository';
import { createMindmapRouter } from './routes/mindmaps';
import { createAuthRouter } from './routes/auth';
import { createUsersRouter } from './routes/users';
import { InMemoryShareTokenRepository } from './repositories/InMemoryShareTokenRepository';
import { MongoShareTokenRepository } from './repositories/MongoShareTokenRepository';
import { IShareTokenRepository } from './repositories/IShareTokenRepository';
import { createSharedRouter } from './routes/shared';

async function bootstrap() {
  const app = express();

  app.use(cors({ origin: config.frontendOrigin, credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());

  let mindmaps: IMindmapRepository;
  let users: IUserRepository;
  let shareTokens: IShareTokenRepository;

  if (config.useMongo) {
    const db = await connectToMongo();
    await assertUsersCollectionExists(db);
    await assertShareTokensCollectionExists(db);
    mindmaps = new MongoMindmapRepository(db);
    users = new MongoUserRepository(db);
    shareTokens = new MongoShareTokenRepository(db);
    console.log('Using MongoDB repositories');
  } else {
    mindmaps = new InMemoryMindmapRepository();
    users = new InMemoryUserRepository();
    shareTokens = new InMemoryShareTokenRepository();
    console.log('Using in-memory repositories');
  }

  app.use('/auth', createAuthRouter(users));
  app.use('/users', createUsersRouter(users));
  app.use('/mindmaps', createMindmapRouter(mindmaps, shareTokens));
  app.use('/shared', createSharedRouter(shareTokens, mindmaps));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', storage: config.useMongo ? 'mongo' : 'in-memory' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
