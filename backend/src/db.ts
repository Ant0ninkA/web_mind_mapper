import { MongoClient, Db } from 'mongodb';
import { config } from './config';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongo(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(config.mongoUri);
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB:', config.mongoUri);
  return db;
}

export async function disconnectFromMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function getDb(): Db {
  if (!db) throw new Error('MongoDB not connected. Call connectToMongo() first.');
  return db;
}

export async function assertUsersCollectionExists(database: Db): Promise<void> {
  const collections = await database.listCollections({ name: 'users' }).toArray();
  if (collections.length === 0) {
    throw new Error(
      "Required collection 'users' is missing. " +
        'The DB owner must run db/init/ scripts to create it before starting this server.',
    );
  }
}

export async function assertShareTokensCollectionExists(database: Db): Promise<void> {
  const collections = await database.listCollections({ name: 'share_tokens' }).toArray();
  if (collections.length === 0) {
    throw new Error(
      "Required collection 'share_tokens' is missing. " +
        'The DB owner must run db/init/ scripts to create it before starting this server.',
    );
  }
}
