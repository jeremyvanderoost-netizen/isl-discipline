import { Router, Request, Response } from 'express';
import { getDatabase } from '../database.js';
import PDFDocument from 'pdfkit';

const router = Router();

// Formateur de date au format belge (Europe/Brussels)
function formatDateBelge(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-BE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function sanitizeFilename(str: string): string {
  return str.toLowerCase().replace(/[^\w\-]/g, '-').replace(/--+/g, '-');
}

router.get('/student/:studentId/pdf', async (req: Request, res: Response) => {
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

    const events: any[] = await db.all(
      'SELECT * FROM discipline_events WHERE student_id = ? ORDER BY event_date DESC',
      [studentId]
    );

    const punitions: any[] = await db.all(
      'SELECT * FROM punitions WHERE student_id = ? ORDER BY detention_date DESC',
      [studentId]
    );

    // Créer le PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configuration du téléchargement
    const filename = `historique-${sanitizeFilename(student.last_name)}-${sanitizeFilename(student.first_name)}-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // En-tête
    doc.fontSize(20).font('Helvetica-Bold').text('Fiche Eleve');
    doc.fontSize(12).font('Helvetica').text(`Date d'export: ${formatDateBelge(new Date().toISOString())}`, { underline: false });
    doc.moveDown();

    // Infos élève
    doc.fontSize(14).font('Helvetica-Bold').text('Identite');
    doc.fontSize(11).font('Helvetica')
      .text(`Nom: ${student.last_name}`)
      .text(`Prenom: ${student.first_name}`)
      .text(`Classe: ${studentClass?.name || 'N/A'}`);
    doc.moveDown();

    // Statistiques
    doc.fontSize(14).font('Helvetica-Bold').text('Statistiques');
    doc.fontSize(11).font('Helvetica').text(`Total des punitions: ${punitionCount.count}`);

    if (activeAlert) {
      doc.fontSize(10).fillColor('red').text(`ALERTE ACTIVE: ${activeAlert.punishment_count_at_trigger} punitions`).fillColor('black');
    }
    doc.moveDown();

    // Historique
    doc.fontSize(14).font('Helvetica-Bold').text('Historique chronologique');

    // Combiner et trier les événements et punitions
    const combined = [
      ...events.map(e => ({
        date: new Date(e.event_date),
        text: `Evenement: ${e.event_type}`,
        details: e.comment || ''
      })),
      ...punitions.map(p => ({
        date: new Date(p.detention_date),
        text: `Punition: ${p.reason || '(sans motif)'}`,
        details: ''
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    if (combined.length === 0) {
      doc.fontSize(10).font('Helvetica').fillColor('gray').text('(Aucun historique)').fillColor('black');
    } else {
      doc.fontSize(10).font('Helvetica');
      combined.forEach(item => {
        const dateStr = formatDateBelge(item.date.toISOString());
        doc.text(`- ${dateStr}: ${item.text}`);
        if (item.details) {
          doc.fontSize(9).fillColor('gray').text(`  ${item.details}`).fillColor('black').fontSize(10);
        }
      });
    }

    // Fin du document
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
});

export default router;
