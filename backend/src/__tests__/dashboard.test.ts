import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { initializeDatabase, getDatabase } from '../database.js';
import dashboardRouter from '../routes/dashboard.js';

let app: express.Express;
let studentId: number;
let studentId2: number;

beforeAll(async () => {
  await initializeDatabase();
  const db = getDatabase();

  const cls = await db.run('INSERT INTO classes (name) VALUES (?)', ['TestClass-Dashboard']);
  const student = await db.run(
    'INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)',
    ['Eva', 'Test', cls.lastID]
  );
  studentId = student.lastID as number;

  const student2 = await db.run(
    'INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)',
    ['Finn', 'Test', cls.lastID]
  );
  studentId2 = student2.lastID as number;

  const now = new Date().toISOString();
  const longAgo = '2000-01-01T10:00:00.000Z';

  await db.run(
    'INSERT INTO discipline_events (student_id, event_type, subcategory, event_date) VALUES (?, ?, ?, ?)',
    [studentId, 'retard', null, now]
  );
  await db.run(
    'INSERT INTO discipline_events (student_id, event_type, subcategory, event_date) VALUES (?, ?, ?, ?)',
    [studentId, 'retard', null, longAgo]
  );
  await db.run(
    'INSERT INTO punitions (student_id, detention_date, reason) VALUES (?, ?, ?)',
    [studentId2, now, 'Bavardage']
  );
  await db.run(
    'INSERT INTO punitions (student_id, detention_date, reason) VALUES (?, ?, ?)',
    [studentId2, longAgo, 'Ancienne punition']
  );

  app = express();
  app.use(express.json());
  app.use('/api/dashboard', dashboardRouter);
});

describe('GET /api/dashboard/today', () => {
  it('retourne uniquement les événements et punitions du jour', async () => {
    const res = await request(app).get('/api/dashboard/today');
    expect(res.status).toBe(200);

    const names = res.body.map((item: any) => `${item.last_name} ${item.first_name}`);
    expect(names).toContain('Test Eva');
    expect(names).toContain('Test Finn');

    const evaItems = res.body.filter((item: any) => item.first_name === 'Eva');
    expect(evaItems).toHaveLength(1);
    expect(evaItems[0].type).toBe('retard');
    expect(evaItems[0].kind).toBe('event');

    const finnItems = res.body.filter((item: any) => item.first_name === 'Finn');
    expect(finnItems).toHaveLength(1);
    expect(finnItems[0].kind).toBe('punition');
    expect(finnItems[0].reason).toBe('Bavardage');
  });

  it('inclut le nom de la classe', async () => {
    const res = await request(app).get('/api/dashboard/today');
    const item = res.body.find((i: any) => i.first_name === 'Eva');
    expect(item.class_name).toBe('TestClass-Dashboard');
  });
});

describe('GET /api/dashboard/history', () => {
  it('regroupe tous les événements et punitions par jour, du plus récent au plus ancien', async () => {
    const res = await request(app).get('/api/dashboard/history');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    const dates = res.body.map((day: any) => day.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);

    const oldDay = res.body.find((day: any) => day.date === '2000-01-01');
    expect(oldDay).toBeDefined();
    const oldNames = oldDay.items.map((i: any) => i.first_name);
    expect(oldNames).toContain('Eva');
    expect(oldNames).toContain('Finn');
  });

  it('ne fait apparaître un jour qu\'une seule fois même avec plusieurs éléments', async () => {
    const res = await request(app).get('/api/dashboard/history');
    const oldDayEntries = res.body.filter((day: any) => day.date === '2000-01-01');
    expect(oldDayEntries).toHaveLength(1);
  });
});
