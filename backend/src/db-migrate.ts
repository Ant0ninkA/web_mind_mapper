import { Db } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_COLLECTION = 'schema_migrations';
const INIT_DIR = path.resolve(__dirname, '../../db/init');

interface MigrationRecord {
  script: string;
  appliedAt: Date;
}

export async function runMigrations(db: Db): Promise<void> {
  const migrations = db.collection<MigrationRecord>(MIGRATIONS_COLLECTION);
  await migrations.createIndex({ script: 1 }, { unique: true });

  const applied = new Set(
    (await migrations.find().toArray()).map((r) => r.script),
  );

  const scripts = fs
    .readdirSync(INIT_DIR)
    .filter((f) => f.endsWith('.js') && /^\d+/.test(f))
    .sort();

  let count = 0;
  for (const script of scripts) {
    if (applied.has(script)) {
      continue;
    }

    const code = fs.readFileSync(path.join(INIT_DIR, script), 'utf-8');
    const fn = new Function('db', 'print', code);
    fn(db, console.log);

    await migrations.insertOne({ script, appliedAt: new Date() });
    console.log(`[migrate] Applied: ${script}`);
    count++;
  }

  if (count === 0) {
    console.log('[migrate] Database is up to date');
  } else {
    console.log(`[migrate] Applied ${count} migration(s)`);
  }
}
