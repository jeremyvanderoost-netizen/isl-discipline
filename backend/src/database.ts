import { createClient, Client } from '@libsql/client';
import path from 'path';

interface DbWrapper {
  get: (sql: string, params?: unknown[]) => Promise<any>;
  all: (sql: string, params?: unknown[]) => Promise<any[]>;
  run: (sql: string, params?: unknown[]) => Promise<{ lastID: number; changes: number }>;
  exec: (sql: string) => Promise<void>;
  close: () => Promise<void>;
}

let client: Client | null = null;
let db: DbWrapper | null = null;

function resolveDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  const localPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'app.db');
  if (localPath === ':memory:') {
    return ':memory:';
  }
  return `file:${localPath}`;
}

async function initializeDatabase(force = false) {
  if (db && !force) return db;

  if (client && force) {
    try {
      client.close();
    } catch (_err) {
      // ignore
    }
  }

  client = createClient({
    url: resolveDatabaseUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  const activeClient = client;

  db = {
    async get(sql, params = []) {
      const result = await activeClient.execute({ sql, args: params as any });
      return result.rows[0] as any;
    },
    async all(sql, params = []) {
      const result = await activeClient.execute({ sql, args: params as any });
      return result.rows as any[];
    },
    async run(sql, params = []) {
      const result = await activeClient.execute({ sql, args: params as any });
      return {
        lastID: Number(result.lastInsertRowid ?? 0),
        changes: result.rowsAffected
      };
    },
    async exec(sql) {
      await activeClient.executeMultiple(sql);
    },
    async close() {
      activeClient.close();
    }
  };

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
    },
    {
      version: 3,
      sql: `
        CREATE TABLE IF NOT EXISTS punitions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          detention_date DATETIME NOT NULL,
          reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          email_sent_at DATETIME,
          email_last_error TEXT,
          email_attempts INTEGER DEFAULT 0,
          FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
        );

        CREATE INDEX idx_punitions_student_id ON punitions(student_id);
        CREATE INDEX idx_punitions_date ON punitions(detention_date);
      `
    },
    {
      version: 4,
      sql: `
        CREATE TABLE IF NOT EXISTS alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          punishment_count_at_trigger INTEGER NOT NULL,
          triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME,
          resolution_comment TEXT,
          FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
        );

        CREATE INDEX idx_alerts_student_id ON alerts(student_id);
        CREATE INDEX idx_alerts_resolved ON alerts(resolved_at);
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

// Turso/libSQL ne permet pas d'ouvrir une transaction via de simples appels
// BEGIN/COMMIT séparés sur le client partagé (chaque execute() n'est pas
// garanti de partager le même contexte) : il faut utiliser son API de
// transaction dédiée (client.transaction()). On sérialise en plus tous les
// appels transactionnels sur une file d'attente, une seule transaction à la
// fois, par prudence.
let transactionQueue: Promise<unknown> = Promise.resolve();

export function runInTransaction<T>(fn: (db: DbWrapper) => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    if (!client) throw new Error('Database not initialized');
    const tx = await client.transaction('write');

    const txDb: DbWrapper = {
      async get(sql, params = []) {
        const result = await tx.execute({ sql, args: params as any });
        return result.rows[0] as any;
      },
      async all(sql, params = []) {
        const result = await tx.execute({ sql, args: params as any });
        return result.rows as any[];
      },
      async run(sql, params = []) {
        const result = await tx.execute({ sql, args: params as any });
        return {
          lastID: Number(result.lastInsertRowid ?? 0),
          changes: result.rowsAffected
        };
      },
      async exec(sql) {
        await tx.execute(sql);
      },
      async close() {
        // no-op: la fermeture est gérée par commit()/rollback()
      }
    };

    try {
      const result = await fn(txDb);
      await tx.commit();
      return result;
    } catch (error) {
      try {
        await tx.rollback();
      } catch (_rollbackError) {
        // la transaction peut déjà être terminée (ex: erreur réseau) ; ignorer
      }
      throw error;
    }
  };

  const result = transactionQueue.then(run, run);
  transactionQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

export { initializeDatabase };
