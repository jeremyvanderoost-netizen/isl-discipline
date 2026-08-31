# Gestion Disciplinaire

Application locale de gestion disciplinaire pour enseignants. Permet de consigner les incidents disciplinaires, générer des rapports PDF et envoyer des notifications par email.

## Architecture

- **Frontend** : React 18 + Vite + TypeScript + Tailwind CSS
- **Backend** : Express + TypeScript + SQLite
- **Base de données** : SQLite 3
- **Génération PDF** : PDFKit
- **Email** : Nodemailer (SMTP Gmail)
- **Tâches planifiées** : node-cron

L'application fonctionne en local sur `localhost`.

## Installation

```bash
npm install
```

Crée un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Édite `.env` avec tes paramètres :
- `PORT` : port du backend (défaut : 3000)
- `DATABASE_PATH` : chemin SQLite (défaut : `./backend/data/app.db`)
- `APP_TIMEZONE` : fuseau horaire (défaut : Europe/Brussels)
- `SMTP_USER` / `SMTP_PASS` : credentials Gmail pour notifications
- `NOTIFICATION_EMAIL` : adresse pour recevoir les notifications

## Démarrage

Démarre le frontend et le backend simultanément :

```bash
npm run dev
```

- Frontend : http://localhost:5173
- Backend : http://localhost:3000
- Route de contrôle : http://localhost:3000/api/health

## Configuration Gmail

Pour envoyer des notifications par email, configure Gmail comme suit :

### 1. Activer l'authentification à deux facteurs

1. Accède à https://myaccount.google.com/
2. Sélectionne "Sécurité" dans le menu gauche
3. Active l'authentification à deux facteurs

### 2. Créer un mot de passe d'application

1. Reviens à la page "Sécurité"
2. Sélectionne "Mots de passe d'application"
3. Sélectionne "Courrier" et "Windows/Mac/Linux"
4. Google génère un mot de passe de 16 caractères

### 3. Configurer les variables d'environnement

```bash
# .env
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # le mot de passe généré par Google
NOTIFICATION_EMAIL=destinataire@example.com  # email pour recevoir les notifications
```

### 4. Notes importantes

- **Authentification à deux facteurs** : généralement requise pour utiliser les mots de passe d'application
- **Limites Gmail** : les limites dépendent de votre compte Google (typiquement 500 emails/jour pour les comptes standard)
- **Modes de développement** : en mode test (`NODE_ENV=test`), les emails sont envoyés via Ethereal (pas d'email réel)
- **Sécurité** : ne commite jamais ton mot de passe dans le `.env` - utilise `.env.local` ou des secrets

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre frontend + backend |
| `npm run build` | Construit frontend + backend |
| `npm run type-check` | Vérifie les types TypeScript |
| `npm run test` | Exécute les tests |

## Structure des dossiers

```
.
├── backend/              # API Express + SQLite
│   ├── src/
│   │   ├── index.ts      # Point d'entrée serveur
│   │   ├── database.ts   # Configuration SQLite + migrations
│   │   └── ...
│   ├── dist/             # Build compilé
│   └── package.json
├── frontend/             # App React + Vite
│   ├── src/
│   │   ├── App.tsx       # Composant racine
│   │   ├── main.tsx      # Point d'entrée
│   │   └── index.css     # Styles Tailwind
│   ├── dist/             # Build produit
│   └── package.json
├── .env.example          # Modèle de configuration
└── package.json          # Root package.json (scripts concurrents)
```

## Fonctionnalités (en développement)

- [ ] Page d'accueil confirmant la connexion
- [ ] Gestion des élèves
- [ ] Enregistrement des incidents disciplinaires
- [ ] Génération de rapports PDF
- [ ] Notifications par email
- [ ] Tâches planifiées

## Notes

- Toutes les timestamps utilisent `Europe/Brussels`
- La base de données est locale (ne pas commiter `.db`)
- Les secrets (`.env`, clés Gmail) ne doivent jamais être dans Git
- Exécute `npm run type-check` avant de commiter
