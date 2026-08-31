import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'app.db');

let db: any = null;

async function initializeDatabase() {
  if (db) return db;

  db = await open({
    filename: DATABASE_PATH,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');
  await runMigrations();

  return db;
}

async function runMigrations() {
  if (!db) throw new Error('Database not initialized');

  const schema = `
    CREATE TABLE IF NOT EXISTS schema_version (
      id INTEGER PRIMARY KEY,
      version INTEGER NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db.exec(schema);

  const result = await db.get('SELECT MAX(version) as max_version FROM schema_version');
  const currentVersion = result?.max_version || 0;

  const migrations = [
    {
      version: 1,
      sql: `
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          class TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `
    }
  ];

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      await db.exec(migration.sql);
      await db.run(
        'INSERT INTO schema_version (version) VALUES (?)',
        [migration.version]
      );
      console.log(`✓ Migration ${migration.version} appliquée`);
    }
  }
}

export function getDatabase() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export { initializeDatabase };
