import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { initializeDatabase, getDatabase } from '../database.js';
import punitionsRouter from '../routes/punitions.js';

let app: express.Express;
let studentId: number;

beforeAll(async () => {
  await initializeDatabase();
  const db = getDatabase();

  const cls = await db.run('INSERT INTO classes (name) VALUES (?)', ['TestClass-Punitions']);
  const student = await db.run(
    'INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)',
    ['Dana', 'Test', cls.lastID]
  );
  studentId = student.lastID as number;

  app = express();
  app.use(express.json());
  app.use('/api/punitions', punitionsRouter);
});

describe('PATCH /api/punitions/:id', () => {
  it('déplace une retenue à une autre date', async () => {
    const created = await request(app)
      .post('/api/punitions')
      .send({ student_id: studentId, detention_date: '2026-09-05T14:00:00.000Z', reason: 'Bavardage' });
    expect(created.status).toBe(201);

    const moved = await request(app)
      .patch(`/api/punitions/${created.body.id}`)
      .send({ detention_date: '2026-09-12T14:00:00.000Z' });

    expect(moved.status).toBe(200);
    expect(moved.body.detention_date).toBe('2026-09-12T14:00:00.000Z');
    expect(moved.body.reason).toBe('Bavardage');
  });

  it('modifie uniquement le motif si seule cette donnée est fournie', async () => {
    const created = await request(app)
      .post('/api/punitions')
      .send({ student_id: studentId, detention_date: '2026-09-05T14:00:00.000Z', reason: 'Ancien motif' });

    const updated = await request(app)
      .patch(`/api/punitions/${created.body.id}`)
      .send({ reason: 'Nouveau motif' });

    expect(updated.status).toBe(200);
    expect(updated.body.reason).toBe('Nouveau motif');
    expect(updated.body.detention_date).toBe('2026-09-05T14:00:00.000Z');
  });

  it('retourne 404 pour une punition inexistante', async () => {
    const res = await request(app)
      .patch('/api/punitions/999999')
      .send({ detention_date: '2026-09-12T14:00:00.000Z' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/punitions/:id', () => {
  it('annule (supprime) une retenue existante', async () => {
    const created = await request(app)
      .post('/api/punitions')
      .send({ student_id: studentId, detention_date: '2026-09-05T14:00:00.000Z' });

    const cancelled = await request(app).delete(`/api/punitions/${created.body.id}`);
    expect(cancelled.status).toBe(200);

    const fetchAfter = await request(app).get(`/api/punitions/${created.body.id}`);
    expect(fetchAfter.status).toBe(404);
  });

  it('retourne 404 en annulant une punition déjà inexistante', async () => {
    const res = await request(app).delete('/api/punitions/999999');
    expect(res.status).toBe(404);
  });
});
