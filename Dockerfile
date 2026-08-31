FROM node:20-alpine

WORKDIR /app

# Copier les fichiers package
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Installer toutes les dépendances (y compris devDeps)
RUN npm install

# Copier le code source
COPY . .

# Build le backend et frontend
RUN npm run build

# Installer seulement les prod deps pour le runtime
WORKDIR /app/backend
RUN npm install --omit=dev

# Lancer le backend
CMD ["npm", "start"]
