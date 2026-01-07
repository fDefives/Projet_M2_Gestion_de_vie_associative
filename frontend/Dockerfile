# Image Node officielle
FROM node:20-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'installation
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application
COPY . .

# Port utilisé par React
EXPOSE 3000

# Lancer l'application React
CMD ["npm", "start"]
