import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';

const router = Router();

router.get('/:studentId/complete', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const studentId = req.params.studentId;

    const student = await db.get('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!student) {
      res.status(404).json({ error: 'Élève non trouvé' });
      return;
    }

    const studentClass = await db.get('SELECT name FROM classes WHERE id = ?', [student.class_id]);

    const punitionCount = await db.get(
      'SELECT COUNT(*) as count FROM punitions WHERE student_id = ?',
      [studentId]
    );

    const activeAlert = await db.get(
      'SELECT * FROM alerts WHERE student_id = ? AND resolved_at IS NULL',
      [studentId]
    );

    const resolvedAlerts = await db.all(
      'SELECT * FROM alerts WHERE student_id = ? AND resolved_at IS NOT NULL ORDER BY resolved_at DESC',
      [studentId]
    );

    const events = await db.all(
      'SELECT * FROM discipline_events WHERE student_id = ? ORDER BY event_date DESC',
      [studentId]
    );

    const punitions = await db.all(
      'SELECT * FROM punitions WHERE student_id = ? ORDER BY detention_date DESC',
      [studentId]
    );

    res.json({
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        class: studentClass?.name || 'N/A'
      },
      punishment_count: punitionCount.count,
      active_alert: activeAlert || null,
      resolved_alerts: resolvedAlerts,
      events,
      punitions
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la fiche' });
  }
});

export default router;
