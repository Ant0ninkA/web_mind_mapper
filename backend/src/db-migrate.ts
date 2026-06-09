import { Db } from 'mongodb';

const MIGRATIONS_COLLECTION = 'schema_migrations';

interface MigrationRecord {
  script: string;
  appliedAt: Date;
}

interface Migration {
  name: string;
  up: (db: Db) => Promise<void>;
}

const mindmapValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['id', 'ownerId', 'name', 'nodes', 'edges', 'createdAt', 'updatedAt'],
    additionalProperties: true,
    properties: {
      _id: {},
      id: {
        bsonType: 'string',
        pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
      },
      ownerId: {
        bsonType: 'string',
        pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
      },
      name: { bsonType: 'string', minLength: 1, maxLength: 200 },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
      nodes: { bsonType: 'array' },
      edges: { bsonType: 'array' },
    },
  },
};

const usersValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['id', 'email', 'username', 'passwordHash', 'createdAt', 'updatedAt'],
    additionalProperties: true,
    properties: {
      _id: {},
      id: {
        bsonType: 'string',
        pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
      },
      email: { bsonType: 'string' },
      username: { bsonType: 'string', minLength: 3, maxLength: 32, pattern: '^[a-zA-Z0-9_]+$' },
      passwordHash: { bsonType: 'string' },
      avatarUrl: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

const shareTokensValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['token', 'mindmapId', 'createdAt'],
    additionalProperties: true,
    properties: {
      _id: {},
      token: {
        bsonType: 'string',
        pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
      },
      mindmapId: { bsonType: 'string' },
      createdAt: { bsonType: 'date' },
    },
  },
};

async function createOrUpdateCollection(
  db: Db,
  name: string,
  validator: object,
): Promise<void> {
  const exists = (await db.listCollections({ name }).toArray()).length > 0;
  if (exists) {
    await db.command({ collMod: name, validator, validationLevel: 'moderate', validationAction: 'error' });
  } else {
    await db.createCollection(name, { validator, validationLevel: 'moderate', validationAction: 'error' });
  }
}

const migrations: Migration[] = [
  {
    name: '01-create-mindmaps-collection',
    up: async (db) => {
      await createOrUpdateCollection(db, 'mindmaps', mindmapValidator);
    },
  },
  {
    name: '02-create-mindmaps-indexes',
    up: async (db) => {
      const col = db.collection('mindmaps');
      await col.createIndex({ id: 1 }, { unique: true, name: 'uniq_id' });
      await col.createIndex({ updatedAt: -1 }, { name: 'by_updatedAt_desc' });
      await col.createIndex({ ownerId: 1 }, { name: 'by_ownerId' });
    },
  },
  {
    name: '04-create-users-collection',
    up: async (db) => {
      await createOrUpdateCollection(db, 'users', usersValidator);
    },
  },
  {
    name: '05-create-users-indexes',
    up: async (db) => {
      const col = db.collection('users');
      await col.createIndex({ id: 1 }, { unique: true, name: 'uniq_id' });
      await col.createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });
      await col.createIndex({ username: 1 }, { unique: true, name: 'uniq_username' });
    },
  },
  {
    name: '06-create-share-tokens-collection',
    up: async (db) => {
      await createOrUpdateCollection(db, 'share_tokens', shareTokensValidator);
    },
  },
  {
    name: '07-create-share-tokens-indexes',
    up: async (db) => {
      const col = db.collection('share_tokens');
      await col.createIndex({ token: 1 }, { unique: true, name: 'uniq_token' });
      await col.createIndex({ mindmapId: 1 }, { unique: true, name: 'uniq_mindmapId' });
    },
  },
];

export async function runMigrations(db: Db): Promise<void> {
  const col = db.collection<MigrationRecord>(MIGRATIONS_COLLECTION);
  await col.createIndex({ script: 1 }, { unique: true });

  const applied = new Set(
    (await col.find().toArray()).map((r) => r.script),
  );

  let count = 0;
  for (const migration of migrations) {
    if (applied.has(migration.name)) {
      continue;
    }

    await migration.up(db);
    await col.insertOne({ script: migration.name, appliedAt: new Date() });
    console.log(`[migrate] Applied: ${migration.name}`);
    count++;
  }

  if (count === 0) {
    console.log('[migrate] Database is up to date');
  } else {
    console.log(`[migrate] Applied ${count} migration(s)`);
  }
}
