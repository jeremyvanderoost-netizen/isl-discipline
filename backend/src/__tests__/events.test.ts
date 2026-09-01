import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { initializeDatabase, getDatabase } from '../database.js';
import eventsRouter from '../routes/events.js';

let app: express.Express;
let studentIds: number[];

beforeAll(async () => {
  await initializeDatabase();
  const db = getDatabase();

  const cls = await db.run('INSERT INTO classes (name) VALUES (?)', ['TestClass-Events']);
  const classId = cls.lastID;

  const alice = await db.run(
    'INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)',
    ['Alice', 'Test', classId]
  );
  const bob = await db.run(
    'INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)',
    ['Bob', 'Test', classId]
  );
  studentIds = [alice.lastID, bob.lastID];

  app = express();
  app.use(express.json());
  app.use('/api/events', eventsRouter);
});

describe('POST /api/events/batch', () => {
  it('crée exactement un événement par élève sélectionné', async () => {
    const db = getDatabase();

    const res = await request(app)
      .post('/api/events/batch')
      .send({ student_ids: studentIds, event_type: 'retard' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveLength(studentIds.length);

    for (const studentId of studentIds) {
      const count = await db.get(
        'SELECT COUNT(*) as count FROM discipline_events WHERE student_id = ? AND event_type = ?',
        [studentId, 'retard']
      );
      expect(count.count).toBe(1);
    }
  });

  it('annule toute la transaction si un élève est invalide (rollback complet)', async () => {
    const db = getDatabase();
    const before = await db.get('SELECT COUNT(*) as count FROM discipline_events');

    const invalidId = 999999;
    const res = await request(app)
      .post('/api/events/batch')
      .send({ student_ids: [studentIds[0], invalidId], event_type: 'matériel_manquant' });

    expect(res.status).toBe(500);

    const after = await db.get('SELECT COUNT(*) as count FROM discipline_events');
    expect(after.count).toBe(before.count);

    const eventForValidStudent = await db.get(
      'SELECT COUNT(*) as count FROM discipline_events WHERE student_id = ? AND event_type = ?',
      [studentIds[0], 'matériel_manquant']
    );
    expect(eventForValidStudent.count).toBe(0);
  });

  it('gère deux requêtes concurrentes (double-clic) sans erreur de transaction imbriquée', async () => {
    const db = getDatabase();
    const before = await db.get('SELECT COUNT(*) as count FROM discipline_events');

    const [res1, res2] = await Promise.all([
      request(app).post('/api/events/batch').send({ student_ids: studentIds, event_type: 'retard' }),
      request(app).post('/api/events/batch').send({ student_ids: studentIds, event_type: 'retard' })
    ]);

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);

    const after = await db.get('SELECT COUNT(*) as count FROM discipline_events');
    expect(after.count).toBe(before.count + studentIds.length * 2);
  });

  it('accepte un travail non fait avec sous-catégorie', async () => {
    const res = await request(app)
      .post('/api/events/batch')
      .send({
        student_ids: [studentIds[0]],
        event_type: 'travail_non_fait',
        subcategory: 'document_oublié',
        comment: 'Cahier oublié à la maison'
      });

    expect(res.status).toBe(201);
    expect(res.body[0].subcategory).toBe('document_oublié');
  });

  it('rejette un type d\'événement invalide', async () => {
    const res = await request(app)
      .post('/api/events/batch')
      .send({ student_ids: [studentIds[0]], event_type: 'absence_injustifiée' });

    expect(res.status).toBe(400);
  });

  it('rejette une sous-catégorie invalide', async () => {
    const res = await request(app)
      .post('/api/events/batch')
      .send({ student_ids: [studentIds[0]], event_type: 'travail_non_fait', subcategory: 'oubli_total' });

    expect(res.status).toBe(400);
  });

  it('rejette une liste d\'élèves vide', async () => {
    const res = await request(app)
      .post('/api/events/batch')
      .send({ student_ids: [], event_type: 'retard' });

    expect(res.status).toBe(400);
  });
});
