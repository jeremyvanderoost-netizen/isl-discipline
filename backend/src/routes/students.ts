import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';
import { Student, CreateStudentRequest } from '../types.js';

const router = Router();

router.get('/class/:classId', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const students: Student[] = await db.all(
      'SELECT * FROM students WHERE class_id = ? ORDER BY last_name, first_name',
      [req.params.classId]
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des élèves' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const student = await db.get('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!student) {
      res.status(404).json({ error: 'Élève non trouvé' });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'élève' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { first_name, last_name, class_id } = req.body as CreateStudentRequest;

    if (!first_name || !last_name || !class_id) {
      res.status(400).json({ error: 'Les champs requis sont manquants' });
      return;
    }

    const classExists = await db.get('SELECT id FROM classes WHERE id = ?', [class_id]);
    if (!classExists) {
      res.status(404).json({ error: 'Classe non trouvée' });
      return;
    }

    const result = await db.run(
      'INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)',
      [first_name.trim(), last_name.trim(), class_id]
    );

    res.status(201).json({
      id: result.lastID,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      class_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'élève' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const studentId = parseInt(req.params.id, 10);

    const student = await db.get('SELECT id FROM students WHERE id = ?', [studentId]);
    if (!student) {
      res.status(404).json({ error: 'Élève non trouvé' });
      return;
    }

    await db.run('DELETE FROM students WHERE id = ?', [studentId]);
    res.json({ message: 'Élève supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'élève' });
  }
});

router.post('/batch/import', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { students, class_id } = req.body as { students: Array<{ first_name: string; last_name: string }>, class_id: number };

    if (!Array.isArray(students) || students.length === 0 || !class_id) {
      res.status(400).json({ error: 'Données invalides' });
      return;
    }

    const classExists = await db.get('SELECT id FROM classes WHERE id = ?', [class_id]);
    if (!classExists) {
      res.status(404).json({ error: 'Classe non trouvée' });
      return;
    }

    const created = [];
    for (const student of students) {
      if (student.first_name && student.last_name) {
        const result = await db.run(
          'INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)',
          [student.first_name.trim(), student.last_name.trim(), class_id]
        );
        created.push({
          id: result.lastID,
          first_name: student.first_name.trim(),
          last_name: student.last_name.trim(),
          class_id
        });
      }
    }

    res.status(201).json({
      imported: created.length,
      students: created
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'import' });
  }
});

export default router;
