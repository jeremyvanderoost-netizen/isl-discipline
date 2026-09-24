import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';

const router = Router();

router.get('/full-dump', async (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const classes = await db.all('SELECT * FROM classes');
    const students = await db.all('SELECT * FROM students');
    const discipline_events = await db.all('SELECT * FROM discipline_events');
    const punitions = await db.all('SELECT * FROM punitions');
    const alerts = await db.all('SELECT * FROM alerts');

    res.json({ classes, students, discipline_events, punitions, alerts });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
});

export default router;
