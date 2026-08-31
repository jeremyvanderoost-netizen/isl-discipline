import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 15;

export async function createBackupIfNeeded() {
  try {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'backend/data/app.db');

    // Ne rien faire si la base n'existe pas encore
    if (!fs.existsSync(dbPath)) {
      console.log('ℹ️ Base de données n\'existe pas encore, sauvegarde ignorée');
      return;
    }

    // Créer le dossier backups s'il n'existe pas
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Créer un nom de sauvegarde avec date et heure
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T').join('_').split('Z')[0];
    const backupPath = path.join(BACKUP_DIR, `app_${timestamp}.db`);

    // Copier la base (compatible avec WAL)
    fs.copyFileSync(dbPath, backupPath);

    // Vérifier si la base utilise WAL et copier les fichiers associés
    const walPath = `${dbPath}-wal`;
    const shmPath = `${dbPath}-shm`;

    if (fs.existsSync(walPath)) {
      fs.copyFileSync(walPath, `${backupPath}-wal`);
    }
    if (fs.existsSync(shmPath)) {
      fs.copyFileSync(shmPath, `${backupPath}-shm`);
    }

    console.log(`✓ Sauvegarde créée: ${backupPath}`);

    // Nettoyer les anciennes sauvegardes
    cleanOldBackups();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    // Ne pas arrêter le serveur si la sauvegarde échoue
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('app_') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS);
      toDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          // Supprimer aussi les fichiers WAL/SHM associés
          try { fs.unlinkSync(`${file.path}-wal`); } catch {}
          try { fs.unlinkSync(`${file.path}-shm`); } catch {}
          console.log(`✓ Sauvegarde supprimée: ${file.name}`);
        } catch (e) {
          console.warn(`⚠️ Impossible de supprimer ${file.name}`);
        }
      });
    }
  } catch (error) {
    console.warn('Erreur lors du nettoyage des sauvegardes:', error);
  }
}

export async function restoreBackup(backupName: string) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Sauvegarde non trouvée: ${backupName}`);
    }

    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'backend/data/app.db');

    // Créer une sauvegarde du fichier actuel avant de restaurer
    if (fs.existsSync(dbPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('Z')[0];
      const beforePath = path.join(BACKUP_DIR, `before_restore_${timestamp}.db`);
      fs.copyFileSync(dbPath, beforePath);
      console.log(`✓ Sauvegarde du fichier actuel créée: ${beforePath}`);
    }

    // Restaurer la sauvegarde
    fs.copyFileSync(backupPath, dbPath);

    // Restaurer aussi les fichiers WAL/SHM s'ils existent
    if (fs.existsSync(`${backupPath}-wal`)) {
      fs.copyFileSync(`${backupPath}-wal`, `${dbPath}-wal`);
    }
    if (fs.existsSync(`${backupPath}-shm`)) {
      fs.copyFileSync(`${backupPath}-shm`, `${dbPath}-shm`);
    }

    console.log(`✓ Base restaurée depuis: ${backupPath}`);
  } catch (error) {
    console.error('Erreur lors de la restauration:', error);
    throw error;
  }
}

export function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }

    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('app_') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  } catch (error) {
    console.error('Erreur lors de la lecture des sauvegardes:', error);
    return [];
  }
}
