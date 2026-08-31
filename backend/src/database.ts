import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'app.db');

let db: any = null;

async function initializeDatabase(force = false) {
  if (db && !force) return db;

  if (db && force) {
    try {
      await db.close();
    } catch (_err) {
      // ignore
    }
  }

  db = null; // Reset db before opening
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
        CREATE TABLE IF NOT EXISTS classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          class_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE
        );

        CREATE INDEX idx_students_class_id ON students(class_id);
      `
    },
    {
      version: 2,
      sql: `
        CREATE TABLE IF NOT EXISTS discipline_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          event_type TEXT NOT NULL CHECK (event_type IN ('retard', 'matériel_manquant', 'travail_non_fait')),
          subcategory TEXT CHECK (subcategory IN ('préparation', 'document_oublié', 'évaluation_non_signée', NULL)),
          comment TEXT,
          event_date DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
        );

        CREATE INDEX idx_events_student_id ON discipline_events(student_id);
        CREATE INDEX idx_events_date ON discipline_events(event_date);
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
