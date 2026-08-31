import { initializeDatabase, getDatabase } from './database.js';
import { unlinkSync } from 'fs';

async function seed() {
  const args = process.argv.slice(2);
  const forceReset = args.includes('--force');

  if (forceReset) {
    console.log('⚠️  Suppression de la base de données existante...');
    try {
      const dbPath = process.env.DATABASE_PATH || './backend/data/app.db';
      unlinkSync(dbPath);
      console.log('✓ Base de données supprimée');
    } catch (_err) {
      // ignore if file doesn't exist
    }
  }

  try {
    await initializeDatabase(forceReset);
    const db = getDatabase();

    try {
      const classesCount = await db.get('SELECT COUNT(*) as count FROM classes');
      if (classesCount.count > 0) {
        console.log('✓ Base de données contient déjà des données');
        console.log('  (utilise --force pour écraser les données existantes)');
        process.exit(0);
      }
    } catch (_err) {
      // Table n'existe pas encore, continuer avec le seed
    }

    console.log('Création des données de démonstration...');

    const classes = [
      { name: '3A' },
      { name: '3B' },
      { name: '4A' }
    ];

    const classMap: { [key: string]: number } = {};

    for (const cls of classes) {
      const result = await db.run('INSERT INTO classes (name) VALUES (?)', [cls.name]);
      classMap[cls.name] = result.lastID;
      console.log(`✓ Classe ${cls.name} créée (ID: ${result.lastID})`);
    }

    const students = [
      { class: '3A', first_name: 'Alice', last_name: 'Martin' },
      { class: '3A', first_name: 'Bob', last_name: 'Dupont' },
      { class: '3A', first_name: 'Charlie', last_name: 'Bernard' },
      { class: '3A', first_name: 'Diana', last_name: 'Rousseau' },
      { class: '3B', first_name: 'Étienne', last_name: 'Leclerc' },
      { class: '3B', first_name: 'Fabienne', last_name: 'Moreau' },
      { class: '3B', first_name: 'Gaston', last_name: 'Robin' },
      { class: '4A', first_name: 'Héléna', last_name: 'Petit' },
      { class: '4A', first_name: 'Igor', last_name: 'Durand' }
    ];

    for (const student of students) {
      const classId = classMap[student.class];
      await db.run(
        'INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)',
        [student.first_name, student.last_name, classId]
      );
      console.log(`✓ Élève ${student.first_name} ${student.last_name} créé (Classe: ${student.class})`);
    }

    console.log('\n✓ Données de démonstration créées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('✗ Erreur lors de la création des données de démonstration:', error);
    process.exit(1);
  }
}

seed();
