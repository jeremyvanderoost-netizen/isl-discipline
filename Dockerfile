FROM node:20-alpine

WORKDIR /app

# Copier les fichiers package
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Installer toutes les dépendances (y compris devDeps)
RUN npm install
RUN cd backend && npm install && cd ..
RUN cd frontend && npm install && cd ..

# Copier le code source
COPY . .

# Build le backend et frontend
RUN npm run build

# Copier les fichiers compilés du frontend vers le répertoire public du backend
RUN mkdir -p /app/backend/public && \
    cp -r /app/frontend/dist/* /app/backend/public/

# Nettoyer et installer seulement les prod deps pour le runtime
WORKDIR /app/backend
RUN rm -rf node_modules && npm install --omit=dev

# Lancer le backend sur 0.0.0.0:3000
CMD ["npm", "start"]
