# 🚀 Guide de Déploiement en Production

Guide pas à pas pour déployer l'application Gestion Vie Associative sur un serveur local.

---

## 📋 Prérequis

### Sur votre machine serveur :
- **Docker** (version 20.10+) et **Docker Compose** (version 2.0+)
- **Git** pour cloner le projet
- Accès **root** ou **sudo**
- Au moins **2 GB de RAM** libre
- Au moins **10 GB d'espace disque**

### Vérification :
```bash
docker --version
docker compose --version
git --version
```

---

## 🔧 Étape 1 : Préparation du Serveur

### 1.1 Cloner le projet
```bash
cd /home/votre_user/
git clone https://github.com/votre-repo/gestion_vie_associative.git
cd gestion_vie_associative
```

### 1.2 Identifier l'IP du serveur
```bash
# Linux/Mac
ip addr show
# ou
ifconfig

# Windows
ipconfig
```
**Notez l'IP locale** (ex: `192.168.1.48`)

---

## 🔐 Étape 2 : Configuration des Variables d'Environnement

### 2.1 Créer le fichier `.env`
```bash
cp .env.example .env
nano .env  # ou vim/vi selon votre éditeur
```

### 2.2 Configurer les variables
Éditez `.env` avec vos valeurs :

```bash
# Database - Mot de passe sécurisé
DB_PASSWORD=VotreMotDePassePostgresSecurise123!

# Django - Générer une clé secrète forte
SECRET_KEY=votre_cle_secrete_aleatoire_de_50_caracteres_minimum

# Mode Debug - DOIT être False en production
DEBUG=False

# Hosts autorisés - Ajoutez l'IP de votre serveur et votre domaine si applicable
ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_IP

# CSRF - Ajoutez http:// ou https:// selon votre config
CSRF_TRUSTED_ORIGINS=http://localhost,YOUR_IP

# CORS - Origine autorisées pour l'API
CORS_ALLOWED_ORIGINS=http://localhost,YOUR_IP

# Gunicorn - Configuration optionnelle
GUNICORN_WORKERS=3
GUNICORN_TIMEOUT=120
```

### 2.3 Générer une SECRET_KEY sécurisée
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```
**Copiez le résultat** dans `SECRET_KEY=` de votre `.env`

### 2.4 Sécuriser le fichier .env
```bash
chmod 600 .env
```

---

## 🏗️ Étape 3 : Configuration Nginx (HTTPS)

Après générations des certificats mettre dans le dossier 
nginx/certs

au besoin renommer dans nignx.conf lignes 19-20
---

## 🐳 Étape 4 : Construction et Lancement
### 4.1 Construire et lancer les conteneurs Docker
```bash
docker compose up --build
```

### 4.3 Vérifier que tout tourne
```bash
docker compose ps
```

Vous devriez voir :
```
NAME                  STATUS
postgres_asso         Up (healthy)
django_backend        Up (healthy)
nginx                 Up
frontend              Exited (0)  # Normal, il a juste copié les fichiers
```

---

## ✅ Étape 5 : Vérification du Déploiement

### 5.1 Vérifier les logs
```bash
# Tous les services
docker compose logs

# Backend uniquement
docker compose logs backend

# Base de données
docker compose logs db

# Nginx
docker compose logs nginx
```

### 5.2 Tester l'accès

#### Depuis la machine serveur :
```bash
curl http://localhost/api/
curl http://localhost/
```

#### Depuis un autre appareil du réseau :
Ouvrez un navigateur et allez sur :
- **Frontend** : `YOUR_IP`


### 5.3 Créer un super utilisateur (Admin)
```bash
docker compose exec backend python manage.py createsuperuser
```

Suivez les instructions pour créer un compte admin.

---

## 🛠️ Commandes Utiles

### Redémarrer les services
```bash
docker compose restart
```

### Arrêter les services
```bash
docker compose down
```

### Arrêter ET supprimer les volumes (⚠️ Perte de données)
```bash
docker compose down -v
```

### Voir les logs en temps réel
```bash
docker compose logs -f backend
```

### Accéder au shell du backend
```bash
docker compose exec backend bash
```

### Accéder à PostgreSQL
```bash
docker compose exec db psql -U postgres -d gestion_associative
```

### Reconstruire après modification du code
```bash
docker compose down
docker compose build
docker compose up -d
```

---

## 🔒 Sécurité en Production

### ✅ Checklist de sécurité

- [ ] `DEBUG=False` dans `.env`
- [ ] `SECRET_KEY` unique et complexe (50+ caractères)
- [ ] `DB_PASSWORD` fort et unique
- [ ] Fichier `.env` avec permissions `600`
- [ ] Firewall configuré (ouvrir uniquement port 80/443)
- [ ] `ALLOWED_HOSTS` configuré avec les domaines/IPs autorisés
- [ ] Sauvegardes régulières de la base de données
- [ ] Certificat SSL/TLS configuré (HTTPS) pour la prod publique
- [ ] Logs régulièrement vérifiés

### Configurer un pare-feu (ufw)
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📦 Sauvegardes

### Sauvegarder la base de données
```bash
docker compose exec db pg_dump -U postgres gestion_associative > backup_$(date +%Y%m%d).sql
```

### Restaurer une sauvegarde
```bash
cat backup_20260202.sql | docker compose exec -T db psql -U postgres gestion_associative
```

### Sauvegarder les fichiers médias
```bash
docker cp django_backend:/app/media ./backup_media_$(date +%Y%m%d)
```

---

## 🐛 Dépannage

### Erreur : "Connection refused" sur l'API
```bash
# Vérifier que le backend tourne
docker compose ps backend

# Vérifier les logs
docker compose logs backend

# Redémarrer le backend
docker compose restart backend
```

### Erreur : "Could not connect to database"
```bash
# Vérifier que PostgreSQL est healthy
docker compose ps db

# Vérifier les logs de la DB
docker compose logs db

# Recréer le conteneur DB (⚠️ perte de données)
docker compose down
docker volume rm gestion_vie_associative_postgres_data
docker compose up -d
```

### Erreur 502 Bad Gateway (Nginx)
```bash
# Le backend n'est pas prêt
docker compose logs backend

# Attendre le healthcheck
docker compose ps backend

# Redémarrer nginx
docker compose restart nginx
```

### Page blanche sur le frontend
```bash
# Vérifier que le build front s'est bien fait
docker compose logs frontend

# Reconstruire le frontend
docker compose build frontend
docker compose up -d
```

### Erreur CORS depuis le navigateur
Vérifiez que `CORS_ALLOWED_ORIGINS` dans `.env` contient l'URL que vous utilisez :
```bash
CORS_ALLOWED_ORIGINS=YOUR_IP,http://localhost
```

---

## 📈 Monitoring et Logs

### Surveiller l'utilisation des ressources
```bash
docker stats
```

### Vérifier l'espace disque
```bash
df -h
docker system df
```

### Nettoyer les images inutilisées
```bash
docker system prune -a
```

---

## 🔄 Mise à Jour de l'Application

### 1. Récupérer les dernières modifications
```bash
git pull origin prod  # ou votre branche de prod
```

### 2. Reconstruire les images
```bash
docker compose build
```

### 3. Appliquer les migrations
```bash
docker compose exec backend python manage.py migrate
```

### 4. Collecter les fichiers statiques
```bash
docker compose exec backend python manage.py collectstatic --noinput
```

### 5. Redémarrer les services
```bash
docker compose restart
```

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker compose logs`
2. Vérifier la checklist de sécurité ci-dessus
3. Consulter la documentation Docker
4. Contacter l'équipe de développement

---

## 🎉 Déploiement Réussi !

Si tout fonctionne :
- ✅ Frontend accessible sur `http://VOTRE_IP/`
- ✅ Base de données opérationnelle
- ✅ Fichiers statiques et médias servis par Nginx

**Félicitations ! Votre application est en production ! 🚀**
