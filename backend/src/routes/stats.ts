import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';

const router = Router();

router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const studentId = req.params.studentId;

    const student = await db.get('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!student) {
      res.status(404).json({ error: 'Élève non trouvé' });
      return;
    }

    const punitionCount = await db.get(
      'SELECT COUNT(*) as count FROM punitions WHERE student_id = ?',
      [studentId]
    );

    const activeAlert = await db.get(
      'SELECT * FROM alerts WHERE student_id = ? AND resolved_at IS NULL',
      [studentId]
    );

    res.json({
      student_id: studentId,
      punishment_count: punitionCount.count,
      active_alert: activeAlert || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;
