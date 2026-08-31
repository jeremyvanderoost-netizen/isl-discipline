import express from 'express';
import { initializeDatabase } from './database.js';

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
