# Image Node officielle
FROM node:20-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'installation
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste de l'application
COPY . .

# Générer le build statique et le copier dans le volume partagé /dist
CMD ["sh", "-c", "npm run build && mkdir -p /dist && cp -r build/* /dist"]
