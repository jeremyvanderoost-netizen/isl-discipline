import express from 'express';
import { initializeDatabase } from './database.js';
import classesRouter from './routes/classes.js';
import studentsRouter from './routes/students.js';
import eventsRouter from './routes/events.js';
import punitionsRouter from './routes/punitions.js';
import alertsRouter from './routes/alerts.js';
import statsRouter from './routes/stats.js';
import studentsDetailRouter from './routes/students-detail.js';
import exportPdfRouter from './routes/export-pdf.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    timezone: process.env.APP_TIMEZONE || 'Europe/Brussels'
  });
});

app.use('/api/classes', classesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/punitions', punitionsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/students-detail', studentsDetailRouter);
app.use('/api/export', exportPdfRouter);

async function startServer() {
  try {
    await initializeDatabase();
    console.log('✓ Base de données initialisée');

    app.listen(PORT, 'localhost', () => {
      console.log(`✓ Serveur lancé sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Erreur de démarrage:', error);
    process.exit(1);
  }
}

startServer();
