import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './database.js';
import { initializeMailer } from './services/notification.js';
import { startNotificationScheduler } from './services/cron.js';
import { createBackupIfNeeded } from './services/backup.js';
import classesRouter from './routes/classes.js';
import studentsRouter from './routes/students.js';
import eventsRouter from './routes/events.js';
import punitionsRouter from './routes/punitions.js';
import alertsRouter from './routes/alerts.js';
import statsRouter from './routes/stats.js';
import studentsDetailRouter from './routes/students-detail.js';
import exportPdfRouter from './routes/export-pdf.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Servir le frontend - Try multiple paths
const publicPaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'public'),
  '/app/backend/public',
  '/app/backend/dist/public'
];

let publicPath = '';
for (const p of publicPaths) {
  if (require('fs').existsSync(path.join(p, 'index.html'))) {
    publicPath = p;
    break;
  }
}

if (!publicPath) {
  publicPath = publicPaths[0];
}

console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));

// Fallback pour SPA: servir index.html pour les routes non-API
app.get('*', (_req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Failed to serve ${indexPath}:`, err);
      res.status(404).json({ error: 'Not found', tried: indexPath });
    }
  });
});

async function startServer() {
  try {
    await createBackupIfNeeded();
    console.log('✓ Sauvegarde complétée');

    await initializeDatabase();
    console.log('✓ Base de données initialisée');

    await initializeMailer();
    startNotificationScheduler();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Serveur lancé sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('✗ Erreur de démarrage:', error);
    process.exit(1);
  }
}

startServer();
