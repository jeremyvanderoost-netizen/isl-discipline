# État du Projet - Gestion Disciplinaire

**Version** : 0.1.0  
**Date de mise à jour** : 2026-08-31  
**Statut** : ✓ Fondations initialisées

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

# Vérifications
npm run type-check       # TypeScript
npm run build            # Production build
npm run test             # Tests (non implémentés)
```

## Routes Disponibles

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/health` | GET | Contrôle du serveur (status, timezone, timestamp) |

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

## Travaux Restants (PARTIE 2+)

- [ ] Gestion des élèves (CRUD)
- [ ] Enregistrement des incidents
- [ ] Génération PDF avec PDFKit
- [ ] Notifications email (Nodemailer)
- [ ] Tâches planifiées (node-cron)
- [ ] Tests unitaires
- [ ] Déploiement et documentation complémentaire

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
