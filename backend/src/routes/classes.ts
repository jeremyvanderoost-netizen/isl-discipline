import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';
import { Class, CreateClassRequest } from '../types.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const classes: Class[] = await db.all('SELECT * FROM classes ORDER BY name');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des classes' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const cls = await db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]);
    if (!cls) {
      res.status(404).json({ error: 'Classe non trouvée' });
      return;
    }
    res.json(cls);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la classe' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { name } = req.body as CreateClassRequest;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Le nom de la classe est requis' });
      return;
    }

    const result = await db.run(
      'INSERT INTO classes (name) VALUES (?)',
      [name.trim()]
    );

    res.status(201).json({
      id: result.lastID,
      name: name.trim(),
      created_at: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Une classe avec ce nom existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la création de la classe' });
    }
  }
});

export default router;
