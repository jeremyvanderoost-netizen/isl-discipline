import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';
import { Alert, ResolveAlertRequest } from '../types.js';

const router = Router();

router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const alerts: Alert[] = await db.all(
      'SELECT * FROM alerts WHERE student_id = ? ORDER BY triggered_at DESC',
      [req.params.studentId]
    );
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des alertes' });
  }
});

router.get('/student/:studentId/active', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const alert: Alert | undefined = await db.get(
      'SELECT * FROM alerts WHERE student_id = ? AND resolved_at IS NULL',
      [req.params.studentId]
    );
    res.json(alert || null);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'alerte' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const alert = await db.get('SELECT * FROM alerts WHERE id = ?', [req.params.id]);
    if (!alert) {
      res.status(404).json({ error: 'Alerte non trouvée' });
      return;
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'alerte' });
  }
});

router.patch('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { comment } = req.body as ResolveAlertRequest;

    const alert = await db.get('SELECT * FROM alerts WHERE id = ?', [req.params.id]);
    if (!alert) {
      res.status(404).json({ error: 'Alerte non trouvée' });
      return;
    }

    if (alert.resolved_at) {
      res.status(400).json({ error: 'Cette alerte est déjà traitée' });
      return;
    }

    const resolvedAt = new Date().toISOString();
    await db.run(
      'UPDATE alerts SET resolved_at = ?, resolution_comment = ? WHERE id = ?',
      [resolvedAt, comment || null, req.params.id]
    );

    res.json({
      id: alert.id,
      student_id: alert.student_id,
      punishment_count_at_trigger: alert.punishment_count_at_trigger,
      triggered_at: alert.triggered_at,
      resolved_at: resolvedAt,
      resolution_comment: comment || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la levée de l\'alerte' });
  }
});

export default router;
