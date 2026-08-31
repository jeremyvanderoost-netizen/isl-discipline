# Gestion Disciplinaire

Application locale de gestion disciplinaire pour enseignants. Consigne les incidents, gère les punitions, génère des rapports PDF, envoie des notifications parents et maintient automatiquement des sauvegardes.

## Prérequis

- **Node.js** : version 18 ou supérieure
- **npm** : version 9 ou supérieure
- **Gmail** (optionnel) : pour les notifications par email

## Installation

### 1. Cloner et installer

```bash
git clone <repo>
cd gestion-disciplinaire
npm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

Édite `.env` avec tes paramètres :

```env
PORT=3000
DATABASE_PATH=./backend/data/app.db
APP_TIMEZONE=Europe/Brussels

# Gmail (optionnel pour notifications)
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
NOTIFICATION_EMAIL=destinataire@example.com
```

## Démarrage

### Mode développement (frontend + backend)

```bash
npm run dev
```

- Frontend : http://localhost:5173
- Backend : http://localhost:3000
- Santé API : http://localhost:3000/api/health

### Mode production

```bash
npm run build
npm run start
```

## Configuration Gmail (notifications)

Pour activer les notifications par email aux parents :

### 1. Activer l'authentification à deux facteurs

1. Accède à https://myaccount.google.com/
2. Sélectionne "Sécurité" dans le menu gauche
3. Active l'authentification à deux facteurs

### 2. Créer un mot de passe d'application

1. Reviens à "Sécurité"
2. Sélectionne "Mots de passe d'application"
3. Choisis "Courrier" et "Windows/Mac/Linux"
4. Google génère un mot de passe de 16 caractères
5. Copie-le dans `.env` → `SMTP_PASS`

### Notes Gmail

- **Authentification requise** : 2FA obligatoire pour les mots de passe d'application
- **Limites** : ~500 emails/jour selon le compte
- **Mode test** : `NODE_ENV=test` utilise Ethereal (pas de vrai email)
- **Sécurité** : ne commite jamais `.env` avec les credentials réels

## Charger les données de démo

L'application crée automatiquement la base de données au premier lancement. Pour charger des données de test :

```bash
# Depuis le dossier backend
npm run seed
```

Cela crée :
- 3 classes (6e A, 6e B, 6e C)
- 10 élèves par classe
- Quelques incidents et retenues de démo

## Sauvegarde et restauration

### Localisation des données

- **Base de données** : `./backend/data/app.db`
- **Sauvegardes** : `./backups/` (créées automatiquement au démarrage)
- **Historique** : jusqu'à 15 dernières sauvegardes conservées

### Sauvegarde manuelle

Les sauvegardes sont créées automatiquement avant chaque démarrage du serveur. Elles sont horodatées : `app_2024-08-31_14-30-45.db`

### Restaurer une sauvegarde

1. Arrête le serveur (`Ctrl+C`)
2. Localise le fichier dans `./backups/`
3. Remplace `./backend/data/app.db` par la sauvegarde
4. Redémarre le serveur (`npm run dev`)

Avant restauration, une sauvegarde de l'état actuel est créée : `before_restore_TIMESTAMP.db`

## Fonctionnalités

✅ **Classes et élèves**
- Créer et gérer des classes
- Ajouter/modifier/supprimer des élèves
- Vue d'ensemble des classes

✅ **Incidents disciplinaires**
- Enregistrer des incidents (dates, raisons)
- Compteur automatique par élève
- Alertes parentes à 3, 6, 9+ punitions

✅ **Fiche élève détaillée**
- Historique complet (incidents, retenues, alertes)
- Compteur de retenues
- Export PDF de la fiche

✅ **Alertes parentes**
- Notification automatique à 3 retenues (1ère alerte)
- Alertes supplémentaires tous les 3 multiples (6, 9, 12...)
- Zone de contact direct (téléphone)
- Historique des alertes résolues

✅ **Notifications par email**
- Envoi à 10 min après création (via Gmail)
- Jusqu'à 5 tentatives en cas d'erreur
- Logs des erreurs
- Mode test avec Ethereal

✅ **Sauvegardes automatiques**
- Avant chaque démarrage
- WAL mode compatible
- Conservation des 15 dernières
- Nettoyage automatique

## Commandes Git essentielles

```bash
# Voir les changements
git status
git log --oneline

# Créer un commit
git add <fichiers>
git commit -m "description des changements"

# Pousser vers le remote
git push origin main
```

## Dépannage

### La base de données est corrompue

Les sauvegardes automatiques te permettent de restaurer l'état précédent (voir section Sauvegarde).

```bash
# Voir les sauvegardes disponibles
ls -lah backups/

# Restaurer manuellement
cp backups/app_2024-08-31_14-30-45.db backend/data/app.db
```

### Les emails n'arrivent pas

1. Vérifie que `SMTP_USER` et `SMTP_PASS` sont corrects dans `.env`
2. Vérifie que 2FA est activé sur le compte Gmail
3. Vérifie que le mot de passe est un "mot de passe d'application" (16 caractères)
4. Regarde les logs du serveur : `email_last_error` contient le message exact
5. En mode test : `NODE_ENV=test` les emails vont à Ethereal

### Les alertes ne se créent pas

1. Vérifie qu'il y a bien 3+ retenues pour l'élève
2. Regarde les logs : une alerte doit être créée
3. Vérifie que tu es sur la bonne élève (cherche par le nom exact)

### Performance lente

1. Vérifie que la base n'est pas trop grosse : `ls -lh backend/data/app.db`
2. Pour les tests, utilise des données de démo limitées
3. Les exports PDF peuvent être lents pour les fiches longues

## Architecture technique

- **Frontend** : React 18 + Vite + TypeScript + Tailwind CSS
- **Backend** : Express + TypeScript
- **Base de données** : SQLite 3 (WAL mode)
- **PDF** : PDFKit
- **Email** : Nodemailer + Gmail SMTP
- **Tâches** : node-cron (vérification toutes les minutes)

## Limitations connues

- Application locale uniquement (pas de déploiement réseau)
- Une instance serveur à la fois (SQLite)
- Export PDF limité à ~50 pages (PDFKit)
- Notifications limitées par Google (500/jour)

## Structure du code

```
.
├── backend/
│   ├── src/
│   │   ├── index.ts           # Point d'entrée serveur
│   │   ├── database.ts        # SQLite + migrations
│   │   ├── services/
│   │   │   ├── backup.ts      # Sauvegarde automatique
│   │   │   ├── notification.ts # Gmail
│   │   │   └── cron.ts        # Planification
│   │   └── routes/            # API endpoints
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Composant racine
│   │   ├── components/        # React components
│   │   └── index.css          # Tailwind
│   └── package.json
├── .env.example               # Modèle config
└── package.json               # Scripts npm
```

## Sécurité

⚠️ **Important** :
- Ne commite jamais `.env` avec des credentials
- Les mots de passe Gmail ne doivent pas être dans Git
- Exécute `npm run type-check` avant de commiter
- Utilise `.env.local` pour les secrets

## Support

Pour les issues techniques, consulte les logs du serveur ou vérifie la section Dépannage ci-dessus.
