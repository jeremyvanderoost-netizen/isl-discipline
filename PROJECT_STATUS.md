# État du Projet - Gestion Disciplinaire

**Version** : 0.3.0  
**Date de mise à jour** : 2026-08-31  
**Statut** : ✓ Punitions et alertes traitables implémentées

## Fonctionnalités Terminées (PARTIE 1)

### Infrastructure
- ✓ Git initialisé
- ✓ Structure backend/frontend séparée
- ✓ Package.json racine avec `npm run dev` (commande unique)
- ✓ TypeScript configuré (backend + frontend)
- ✓ React 18 + Vite configurés
- ✓ Tailwind CSS configuré avec PostCSS
- ✓ Express configuré
- ✓ SQLite3 + migrations système
- ✓ .gitignore complet
- ✓ .env.example avec toutes les variables

### Backend
- ✓ Route `/api/health` de contrôle
- ✓ Serveur Express sur localhost:3000
- ✓ Initialisation de base de données (schema_version, students table)
- ✓ Fichier `database.ts` pour migrations futures

### Frontend
- ✓ Page d'accueil minimale
- ✓ Vérification de la connexion au backend
- ✓ Affichage du statut et du fuseau horaire
- ✓ Design Tailwind CSS propre

### Documentation
- ✓ README.md en français
- ✓ PROJECT_STATUS.md (ce fichier)

## Commandes Utiles

```bash
# Installation
npm install

# Configuration
cp .env.example .env

# Développement
npm run dev              # Lance frontend + backend
npm run dev:backend      # Backend seul (localhost:3000)
npm run dev:frontend     # Frontend seul (localhost:5173)

# Base de données
npm run seed             # Crée données de démonstration (si DB vide)
npm run seed:force       # Réinitialise base de données + données

# Vérifications
npm run type-check       # TypeScript
npm run build            # Production build
npm run test             # Tests (non implémentés)
```

## Routes Disponibles

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/health` | GET | Contrôle du serveur (status, timezone, timestamp) |
| `/api/classes` | GET | Liste toutes les classes |
| `/api/classes` | POST | Crée une classe (body: `{name}`) |
| `/api/classes/:id` | GET | Récupère une classe par ID |
| `/api/students/class/:classId` | GET | Liste les élèves d'une classe |
| `/api/students` | POST | Crée un élève (body: `{first_name, last_name, class_id}`) |
| `/api/events/student/:studentId` | GET | Liste les événements d'un élève |
| `/api/events` | POST | Crée un événement (body: `{student_id, event_type, subcategory?, comment?}`) |
| `/api/events/batch` | POST | Crée plusieurs événements avec transaction (body: `{student_ids[], event_type, subcategory?, comment?}`) |

## Décisions d'Architecture

1. **Commande unique `npm run dev`** : utilise `concurrently` pour démarrer backend et frontend simultanément
2. **Structure séparée** : dossiers `backend/` et `frontend/` avec package.json propres pour flexibilité
3. **SQLite local** : stockage simple en fichier, parfait pour une app locale
4. **Migrations système** : table `schema_version` pour tracker les versions DB appliquées
5. **Proxy Vite** : frontend proxifie `/api/*` vers le backend automatiquement

## Variables d'Environnement

À configurer dans `.env` :

```
PORT=3000
DATABASE_PATH=./backend/data/app.db
APP_TIMEZONE=Europe/Brussels
SMTP_USER=...
SMTP_PASS=...
NOTIFICATION_EMAIL=...
```

## Fonctionnalités Terminées (PARTIE 2)

### Backend - Routes API
- ✓ GET `/api/classes` - Liste toutes les classes
- ✓ GET `/api/classes/:id` - Récupère une classe par ID
- ✓ POST `/api/classes` - Crée une classe
- ✓ GET `/api/students/class/:classId` - Liste les élèves d'une classe
- ✓ POST `/api/students` - Crée un élève
- ✓ GET `/api/events/student/:studentId` - Liste les événements d'un élève
- ✓ POST `/api/events` - Crée un événement disciplinaire
- ✓ POST `/api/events/batch` - Crée plusieurs événements (transaction SQLite)

### Backend - Migrations
- ✓ Migration 1 : Création tables classes et students
- ✓ Migration 2 : Création table discipline_events

### Backend - Seed / Démonstration
- ✓ Commande `npm run seed` - Crée 3 classes et 9 élèves
- ✓ Commande `npm run seed:force` - Réinitialise la base de données

### Frontend - Composants
- ✓ ClassList - Écran d'accueil affichant les classes
- ✓ ClassDetail - Liste responsive des élèves avec sélection
- ✓ ActionBar - Barre d'actions tactile pour ajouter des événements
- ✓ useApi hook - Gestion centralisée des appels API

### Frontend - Fonctionnalités
- ✓ Sélection d'un ou plusieurs élèves
- ✓ Sélectionner tous / Désélectionner tous
- ✓ Trois types d'événements : Retard, Matériel, Travail
- ✓ Sous-catégories pour Travail non fait
- ✓ Commentaire facultatif
- ✓ Messages de succès/erreur
- ✓ Protection double-clics (loading state)
- ✓ Responsive design (tablette compatible)

## Fonctionnalités Terminées (PARTIE 3)

### Backend - Routes API
- ✓ POST `/api/punitions` - Crée une retenue
- ✓ POST `/api/punitions/batch` - Crée plusieurs retenues avec transaction
- ✓ GET `/api/punitions/student/:studentId` - Liste les retenues
- ✓ GET `/api/stats/student/:studentId` - Statistiques (compteur + alerte active)
- ✓ GET `/api/alerts/student/:studentId` - Liste alertes par élève
- ✓ GET `/api/alerts/student/:studentId/active` - Alerte active (null si aucune)
- ✓ PATCH `/api/alerts/:id/resolve` - Traite une alerte

### Backend - Migrations
- ✓ Migration 3 : Table punitions (date, motif, email tracking)
- ✓ Migration 4 : Table alerts (statut, résolution, commentaire)

### Backend - Logique d'alertes
- ✓ Alerte créée automatiquement à punition 3
- ✓ Alerte créée après levée à punition +3 (6, 9, etc.)
- ✓ Statut calculé dynamiquement (à venir/passée)
- ✓ Historique des alertes conservé
- ✓ Une seule alerte active par élève

### Frontend - Composants
- ✓ StudentRow - Affiche compteur et badge alerte
- ✓ AlertDialog - Traite alertes avec confirmation
- ✓ PunitionActionBar - Ajoute retenues avec date/motif
- ✓ Chargement stats par élève

### Frontend - Fonctionnalités
- ✓ Compteur de punitions affichées
- ✓ Badge orange/rouge pour alertes
- ✓ Ajout retenues (simple et multiple)
- ✓ DatePicker pour date/heure retenue
- ✓ Motif facultatif
- ✓ Traitement alertes avec commentaire
- ✓ Protection double-clics (loading)
- ✓ Messages de succès/erreur

## Travaux Restants (PARTIE 4+)

- [ ] Génération PDF avec PDFKit
- [ ] Notifications email (Nodemailer)
- [ ] Tâches planifiées (node-cron)
- [ ] Interface export données
- [ ] Tests unitaires
- [ ] Déploiement

## Tests de Validation (PARTIE 1)

✓ `npm install` fonctionne  
✓ `npm run dev` lance le frontend et le backend  
✓ Le frontend accède à `/api/health`  
✓ TypeScript compile sans erreurs  
✓ Build produit réussit  

**Commit attendu** : `chore: initialiser les fondations du projet`

## Notes

- Fuseau horaire imposé : Europe/Brussels
- Exécution locale uniquement (localhost)
- Aucun secret, `.db`, ou `.env` ne doit être dans Git
- Chaque PARTIE corrige ses tests avant de terminer
