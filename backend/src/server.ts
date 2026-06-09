import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { connectToMongo, assertUsersCollectionExists } from './db';
import { InMemoryMindmapRepository } from './repositories/InMemoryMindmapRepository';
import { MongoMindmapRepository } from './repositories/MongoMindmapRepository';
import { IMindmapRepository } from './repositories/IMindmapRepository';
import { InMemoryUserRepository } from './repositories/InMemoryUserRepository';
import { MongoUserRepository } from './repositories/MongoUserRepository';
import { IUserRepository } from './repositories/IUserRepository';
import { createMindmapRouter } from './routes/mindmaps';
import { createAuthRouter } from './routes/auth';
import { createUsersRouter } from './routes/users';

async function bootstrap() {
  const app = express();

  app.use(cors({ origin: config.frontendOrigin, credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());

  let mindmaps: IMindmapRepository;
  let users: IUserRepository;

  if (config.useMongo) {
    const db = await connectToMongo();
    await assertUsersCollectionExists(db);
    mindmaps = new MongoMindmapRepository(db);
    users = new MongoUserRepository(db);
    console.log('Using MongoDB repositories');
  } else {
    mindmaps = new InMemoryMindmapRepository();
    users = new InMemoryUserRepository();
    console.log('Using in-memory repositories');
  }

  app.use('/auth', createAuthRouter(users));
  app.use('/users', createUsersRouter(users));
  app.use('/mindmaps', createMindmapRouter(mindmaps));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', storage: config.useMongo ? 'mongo' : 'in-memory' });
  });

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
