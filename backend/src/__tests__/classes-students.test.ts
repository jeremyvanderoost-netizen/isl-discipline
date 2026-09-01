import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { initializeDatabase } from '../database.js';
import classesRouter from '../routes/classes.js';
import studentsRouter from '../routes/students.js';

let app: express.Express;

beforeAll(async () => {
  await initializeDatabase();
  app = express();
  app.use(express.json());
  app.use('/api/classes', classesRouter);
  app.use('/api/students', studentsRouter);
});

describe('Classes', () => {
  it('crée une classe avec un nom unique et peut l\'afficher ensuite', async () => {
    const created = await request(app).post('/api/classes').send({ name: 'Test-3C' });
    expect(created.status).toBe(201);

    const list = await request(app).get('/api/classes');
    expect(list.status).toBe(200);
    expect(list.body.some((c: { name: string }) => c.name === 'Test-3C')).toBe(true);
  });

  it('refuse la création d\'une classe avec un nom déjà existant', async () => {
    await request(app).post('/api/classes').send({ name: 'Test-3D' });
    const duplicate = await request(app).post('/api/classes').send({ name: 'Test-3D' });
    expect(duplicate.status).toBe(409);
  });
});

describe('Élèves', () => {
  it('crée un élève rattaché à une classe avec dates de création/modification', async () => {
    const cls = await request(app).post('/api/classes').send({ name: 'Test-3E' });
    const classId = cls.body.id;

    const student = await request(app)
      .post('/api/students')
      .send({ first_name: 'Chloé', last_name: 'Test', class_id: classId });

    expect(student.status).toBe(201);
    expect(student.body.created_at).toBeTruthy();
    expect(student.body.updated_at).toBeTruthy();

    const list = await request(app).get(`/api/students/class/${classId}`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
  });

  it('refuse la création d\'un élève pour une classe inexistante', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({ first_name: 'Fantôme', last_name: 'Inexistant', class_id: 999999 });

    expect(res.status).toBe(404);
  });
});
