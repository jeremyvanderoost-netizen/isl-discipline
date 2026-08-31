import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';
import { Punition, CreatePunitionRequest, CreatePunitionsRequest } from '../types.js';

const router = Router();

router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const punitions: Punition[] = await db.all(
      'SELECT * FROM punitions WHERE student_id = ? ORDER BY detention_date DESC',
      [req.params.studentId]
    );
    res.json(punitions);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des punitions' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const punition = await db.get('SELECT * FROM punitions WHERE id = ?', [req.params.id]);
    if (!punition) {
      res.status(404).json({ error: 'Punition non trouvée' });
      return;
    }
    res.json(punition);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la punition' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { student_id, detention_date, reason } = req.body as CreatePunitionRequest;

    if (!student_id || !detention_date) {
      res.status(400).json({ error: 'Les champs requis sont manquants' });
      return;
    }

    const student = await db.get('SELECT id FROM students WHERE id = ?', [student_id]);
    if (!student) {
      res.status(404).json({ error: 'Élève non trouvé' });
      return;
    }

    const result = await db.run(
      'INSERT INTO punitions (student_id, detention_date, reason) VALUES (?, ?, ?)',
      [student_id, detention_date, reason || null]
    );

    // Check for alert
    const punitionCount = await db.get(
      'SELECT COUNT(*) as count FROM punitions WHERE student_id = ?',
      [student_id]
    );

    if (punitionCount.count >= 3) {
      const activeAlert = await db.get(
        'SELECT id FROM alerts WHERE student_id = ? AND resolved_at IS NULL',
        [student_id]
      );

      if (!activeAlert) {
        const lastResolvedAlert = await db.get(
          'SELECT punishment_count_at_trigger FROM alerts WHERE student_id = ? AND resolved_at IS NOT NULL ORDER BY resolved_at DESC LIMIT 1',
          [student_id]
        );

        const shouldCreateAlert = !lastResolvedAlert || punitionCount.count >= lastResolvedAlert.punishment_count_at_trigger + 3;

        if (shouldCreateAlert) {
          await db.run(
            'INSERT INTO alerts (student_id, punishment_count_at_trigger) VALUES (?, ?)',
            [student_id, punitionCount.count]
          );
        }
      }
    }

    res.status(201).json({
      id: result.lastID,
      student_id,
      detention_date,
      reason: reason || null,
      created_at: new Date().toISOString(),
      email_sent_at: null,
      email_last_error: null,
      email_attempts: 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la punition' });
  }
});

router.post('/batch', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { student_ids, detention_date, reason } = req.body as CreatePunitionsRequest;

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0 || !detention_date) {
      res.status(400).json({ error: 'Les champs requis sont manquants' });
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
          'INSERT INTO punitions (student_id, detention_date, reason) VALUES (?, ?, ?)',
          [student_id, detention_date, reason || null]
        );

        results.push({
          id: result.lastID,
          student_id,
          detention_date,
          reason: reason || null,
          created_at: now,
          email_sent_at: null,
          email_last_error: null,
          email_attempts: 0
        });
      }

      // Check for alerts after creating punitions
      for (const student_id of student_ids) {
        const punitionCount = await db.get(
          'SELECT COUNT(*) as count FROM punitions WHERE student_id = ?',
          [student_id]
        );

        const activeAlert = await db.get(
          'SELECT id FROM alerts WHERE student_id = ? AND resolved_at IS NULL',
          [student_id]
        );

        if (!activeAlert && punitionCount.count >= 3) {
          // Check if this is the 3rd, 6th, 9th, etc.
          const lastResolvedAlert = await db.get(
            'SELECT punishment_count_at_trigger FROM alerts WHERE student_id = ? AND resolved_at IS NOT NULL ORDER BY resolved_at DESC LIMIT 1',
            [student_id]
          );

          const shouldCreateAlert = !lastResolvedAlert || punitionCount.count >= lastResolvedAlert.punishment_count_at_trigger + 3;

          if (shouldCreateAlert) {
            await db.run(
              'INSERT INTO alerts (student_id, punishment_count_at_trigger) VALUES (?, ?)',
              [student_id, punitionCount.count]
            );
          }
        }
      }

      await db.exec('COMMIT');
      res.status(201).json(results);
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erreur lors de la création des punitions' });
  }
});

export default router;
