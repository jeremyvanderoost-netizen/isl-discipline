import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';
import { getTodayRangeUTC, getDateKeyInTimezone } from '../utils/dateRange.js';

const router = Router();

interface DisciplineItem {
  class_name: string;
  first_name: string;
  last_name: string;
  date: string;
  kind: 'event' | 'punition';
  type?: string;
  subcategory?: string | null;
  comment?: string | null;
  reason?: string | null;
}

async function fetchDisciplineItems(range?: { start: string; end: string }): Promise<DisciplineItem[]> {
  const db = getDatabase();

  const eventsQuery = `
    SELECT s.first_name, s.last_name, c.name as class_name,
           e.event_type as type, e.subcategory, e.comment, e.event_date as date
    FROM discipline_events e
    JOIN students s ON s.id = e.student_id
    JOIN classes c ON c.id = s.class_id
    ${range ? 'WHERE e.event_date >= ? AND e.event_date <= ?' : ''}
  `;
  const punitionsQuery = `
    SELECT s.first_name, s.last_name, c.name as class_name,
           p.reason, p.detention_date as date
    FROM punitions p
    JOIN students s ON s.id = p.student_id
    JOIN classes c ON c.id = s.class_id
    ${range ? 'WHERE p.detention_date >= ? AND p.detention_date <= ?' : ''}
  `;

  const params = range ? [range.start, range.end] : [];
  const events = await db.all(eventsQuery, params);
  const punitions = await db.all(punitionsQuery, params);

  return [
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
  ];
}

function sortByClassThenName(items: DisciplineItem[]): DisciplineItem[] {
  return [...items].sort((a, b) => {
    if (a.class_name !== b.class_name) return a.class_name.localeCompare(b.class_name);
    if (a.last_name !== b.last_name) return a.last_name.localeCompare(b.last_name);
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

router.get('/today', async (_req: Request, res: Response) => {
  try {
    const range = getTodayRangeUTC(process.env.APP_TIMEZONE || 'Europe/Brussels');
    const items = await fetchDisciplineItems(range);
    res.json(sortByClassThenName(items));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du compte rendu du jour' });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  try {
    const timezone = process.env.APP_TIMEZONE || 'Europe/Brussels';
    const items = await fetchDisciplineItems();

    const groups = new Map<string, DisciplineItem[]>();
    for (const item of items) {
      const dayKey = getDateKeyInTimezone(item.date, timezone);
      if (!groups.has(dayKey)) groups.set(dayKey, []);
      groups.get(dayKey)!.push(item);
    }

    const days = Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, dayItems]) => ({
        date,
        items: sortByClassThenName(dayItems)
      }));

    res.json(days);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

export default router;
