import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';
import { getTodayRangeUTC } from '../utils/dateRange.js';

const router = Router();

router.get('/today', async (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { start, end } = getTodayRangeUTC(process.env.APP_TIMEZONE || 'Europe/Brussels');

    const events = await db.all(
      `SELECT s.first_name, s.last_name, c.name as class_name,
              e.event_type as type, e.subcategory, e.comment, e.event_date as date
       FROM discipline_events e
       JOIN students s ON s.id = e.student_id
       JOIN classes c ON c.id = s.class_id
       WHERE e.event_date >= ? AND e.event_date <= ?`,
      [start, end]
    );

    const punitions = await db.all(
      `SELECT s.first_name, s.last_name, c.name as class_name,
              p.reason, p.detention_date as date
       FROM punitions p
       JOIN students s ON s.id = p.student_id
       JOIN classes c ON c.id = s.class_id
       WHERE p.detention_date >= ? AND p.detention_date <= ?`,
      [start, end]
    );

    const items = [
      ...events.map((e: any) => ({
        class_name: e.class_name,
        first_name: e.first_name,
        last_name: e.last_name,
        date: e.date,
        kind: 'event' as const,
        type: e.type,
        subcategory: e.subcategory,
        comment: e.comment
      })),
      ...punitions.map((p: any) => ({
        class_name: p.class_name,
        first_name: p.first_name,
        last_name: p.last_name,
        date: p.date,
        kind: 'punition' as const,
        reason: p.reason
      }))
    ].sort((a, b) => {
      if (a.class_name !== b.class_name) return a.class_name.localeCompare(b.class_name);
      if (a.last_name !== b.last_name) return a.last_name.localeCompare(b.last_name);
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du compte rendu du jour' });
  }
});

export default router;
