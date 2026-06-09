import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { connectToMongo } from './db';
import { initializeDatabase } from './initDb';
import { InMemoryMindmapRepository } from './repositories/InMemoryMindmapRepository';
import { MongoMindmapRepository } from './repositories/MongoMindmapRepository';
import { IMindmapRepository } from './repositories/IMindmapRepository';
import { createMindmapRouter } from './routes/mindmaps';

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  let repo: IMindmapRepository;

  if (config.useMongo) {
    const db = await connectToMongo();
    await initializeDatabase(db);
    repo = new MongoMindmapRepository(db);
    console.log('Using MongoDB repository');
  } else {
    repo = new InMemoryMindmapRepository();
    console.log('Using in-memory repository');
  }

  app.use('/mindmaps', createMindmapRouter(repo));

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
