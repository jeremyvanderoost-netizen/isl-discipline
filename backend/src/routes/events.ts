import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';
import { DisciplineEvent, CreateDisciplineEventRequest, CreateDisciplineEventsRequest } from '../types.js';

const router = Router();

const VALID_EVENT_TYPES = ['retard', 'matériel_manquant', 'travail_non_fait'];
const VALID_SUBCATEGORIES = [null, 'préparation', 'document_oublié', 'évaluation_non_signée'];

router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const events: DisciplineEvent[] = await db.all(
      'SELECT * FROM discipline_events WHERE student_id = ? ORDER BY event_date DESC',
      [req.params.studentId]
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const event = await db.get('SELECT * FROM discipline_events WHERE id = ?', [req.params.id]);
    if (!event) {
      res.status(404).json({ error: 'Événement non trouvé' });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'événement' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { student_id, event_type, subcategory, comment } = req.body as CreateDisciplineEventRequest;

    if (!student_id || !event_type) {
      res.status(400).json({ error: 'Les champs requis sont manquants' });
      return;
    }

    if (!VALID_EVENT_TYPES.includes(event_type)) {
      res.status(400).json({ error: 'Type d\'événement invalide' });
      return;
    }

    if (subcategory && !VALID_SUBCATEGORIES.includes(subcategory)) {
      res.status(400).json({ error: 'Sous-catégorie invalide' });
      return;
    }

    const student = await db.get('SELECT id FROM students WHERE id = ?', [student_id]);
    if (!student) {
      res.status(404).json({ error: 'Élève non trouvé' });
      return;
    }

    const result = await db.run(
      'INSERT INTO discipline_events (student_id, event_type, subcategory, comment, event_date) VALUES (?, ?, ?, ?, ?)',
      [student_id, event_type, subcategory || null, comment || null, new Date().toISOString()]
    );

    res.status(201).json({
      id: result.lastID,
      student_id,
      event_type,
      subcategory: subcategory || null,
      comment: comment || null,
      event_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'événement' });
  }
});

router.post('/batch', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { student_ids, event_type, subcategory, comment } = req.body as CreateDisciplineEventsRequest;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0 || !event_type) {
      res.status(400).json({ error: 'Les champs requis sont manquants' });
      return;
    }

    if (!VALID_EVENT_TYPES.includes(event_type)) {
      res.status(400).json({ error: 'Type d\'événement invalide' });
      return;
    }

    if (subcategory && !VALID_SUBCATEGORIES.includes(subcategory)) {
      res.status(400).json({ error: 'Sous-catégorie invalide' });
      return;
    }

    await db.exec('BEGIN TRANSACTION');

    try {
      const results = [];
      const now = new Date().toISOString();

      for (const student_id of student_ids) {
        const student = await db.get('SELECT id FROM students WHERE id = ?', [student_id]);
        if (!student) {
          throw new Error(`Élève avec ID ${student_id} non trouvé`);
        }

        const result = await db.run(
          'INSERT INTO discipline_events (student_id, event_type, subcategory, comment, event_date) VALUES (?, ?, ?, ?, ?)',
          [student_id, event_type, subcategory || null, comment || null, now]
        );

        results.push({
          id: result.lastID,
          student_id,
          event_type,
          subcategory: subcategory || null,
          comment: comment || null,
          event_date: now,
          created_at: now
        });
      }

      await db.exec('COMMIT');
      res.status(201).json(results);
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erreur lors de la création des événements' });
  }
});

export default router;
