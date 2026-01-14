# API Gestion Vie Associative ULR

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation & Démarrage](#installation--démarrage)
4. [Authentification](#authentification)
5. [Système de Rôles](#système-de-rôles)
6. [Endpoints API](#endpoints-api)
7. [Intégration React](#intégration-react)
8. [Déploiement Docker](#déploiement-docker)
9. [Documentation complète](#documentation-complète)

---

## 📊 Vue d'ensemble

API **Django REST Framework** pour gérer les associations universitaires avec:
- ✅ Authentification JWT sécurisée
- ✅ Système de rôles (Admin/Utilisateur)
- ✅ Gestion complète des documents
- ✅ Système de notifications
- ✅ CORS configuré pour React

### Utilisateurs créés par défaut

```
Admin:  admin@example.com / admin123
User 1: user1@example.com / pass123
User 2: user2@example.com / pass123
```

---

## 🏗️ Architecture

```
gestion_vie_associative/
├── backend/
│   ├── api/                      # Application Django
│   │   ├── models.py             # 6 modèles (User, Association, etc.)
│   │   ├── serializers.py        # Sérialisation
│   │   ├── views.py              # 6 ViewSets (logique RBAC)
│   │   ├── permissions.py        # Permissions personnalisées
│   │   ├── urls.py               # Routes API
│   │   ├── admin.py              # Interface admin Django
│   │   └── management/commands/init_db.py  # Init données
│   ├── config/                   # Configuration Django
│   │   └── settings.py           # JWT, CORS, BD config
│   ├── requirements.txt          # Dépendances
│   ├── Dockerfile                # Image Docker
│   ├── API_DOCUMENTATION.md      # Endpoints complets
│   ├── ROLES_AND_PERMISSIONS.md # Système de rôles
│   └── IMPLEMENTATION_SUMMARY.md # Résumé implémentation
│
├── frontend/
│   ├── src/
│   │   ├── api.js                # Client API + tous les endpoints
│   │   ├── hooks.js              # Hook useAuth(), composants React
│   │   └── ...
│   └── Dockerfile
│
├── db/
│   ├── 01-init.sql               # Script initialisation BD
│   └── ...
│
└── docker-compose.yml            # Orchestration complète
```

---

## 🚀 Installation & Démarrage

### Option 1: Démarrage Direct

```bash
# 1. Installer les dépendances
cd backend
pip install -r requirements.txt

# 2. Migrations
python manage.py migrate

# 3. Initialiser les données test
python manage.py init_db

# 4. Démarrer le serveur
python manage.py runserver
```

**API accessible**: `http://localhost:8000/api/`

### Option 2: Avec Docker (Recommandé)

```bash
# À partir du dossier racine
docker-compose up

# Ou en arrière-plan
docker-compose up -d
```

**Services disponibles**:
- 🐘 PostgreSQL: `localhost:5432`
- 🔌 API Django: `http://localhost:8000`
- ⚛️ React Frontend: `http://localhost:3000`

---

## 🔐 Authentification

### 1. Enregistrement

```bash
POST /api/users/register/
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "securepass123",
  "password2": "securepass123",
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

### 2. Connexion

```bash
POST /api/auth/login/
{
  "username": "newuser",
  "password": "securepass123"
}

# Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 3. Utiliser le Token

Toutes les requêtes nécessitent:
```
Authorization: Bearer <access_token>
```

### 4. Rafraîchir le Token

```bash
POST /api/auth/refresh/
{
  "refresh": "<refresh_token>"
}
```

---

## 👥 Système de Rôles

### ADMIN 👨‍💼

**Permissions**:
- ✅ Voir **tous** les documents de **toutes** les associations
- ✅ Approuver/Rejeter les documents
- ✅ Accéder à tous les utilisateurs
- ✅ Gérer les types de documents

**Endpoints spécifiques**:
```
GET    /api/documents/                        # Tous les docs
GET    /api/documents/by_association/?id=1   # Docs d'une assoc
PATCH  /api/documents/{id}/approve/
PATCH  /api/documents/{id}/reject/
GET    /api/users/                            # Tous les users
```

### USER 👤

**Permissions**:
- ✅ Voir **uniquement** ses documents
- ✅ Ajouter/Modifier/Supprimer ses documents
- ✅ Voir son association
- ✅ Voir les membres
- ❌ NE PAS voir les documents d'autres
- ❌ NE PAS approuver/rejeter

**Endpoints accessibles**:
```
GET    /api/documents/              # Ses docs uniquement
POST   /api/documents/              # Upload
DELETE /api/documents/{id}/         # Supprimer le sien
GET    /api/associations/           # Son assoc
GET    /api/notifications/          # Ses notifications
```

### Logique d'Implémentation

```python
# Backend filtre automatiquement:
GET /api/documents/

if user.role == 'admin':
    return Document.objects.all()  # Tous
else:
    return Document.objects.filter(
        id_association__id_utilisateur=user  # Ses docs
    )
```

---

## 📡 Endpoints API

### Authentification
```
POST   /api/auth/login/
POST   /api/auth/refresh/
POST   /api/users/register/
GET    /api/users/me/
```

### Documents (RBAC Principal)
```
GET    /api/documents/              # Filtrés par rôle ⭐
POST   /api/documents/              # Upload
PATCH  /api/documents/{id}/
DELETE /api/documents/{id}/
GET    /api/documents/my_documents/
GET    /api/documents/by_status/
PATCH  /api/documents/{id}/approve/    # Admin seulement
PATCH  /api/documents/{id}/reject/     # Admin seulement
```

### Associations
```
GET    /api/associations/           # Filtrées par rôle
POST   /api/associations/
GET    /api/associations/{id}/
GET    /api/associations/{id}/documents/
GET    /api/associations/{id}/members/
```

### Membres
```
GET    /api/membres/
POST   /api/membres/
GET    /api/membres/{id}/
PATCH  /api/membres/{id}/
DELETE /api/membres/{id}/
```

### Notifications
```
GET    /api/notifications/
GET    /api/notifications/unread/
POST   /api/notifications/mark_as_read/
```

### Types Documents
```
GET    /api/type-documents/
POST   /api/type-documents/          # Admin seulement
```

---

## ⚛️ Intégration React

### Installation

```bash
cd frontend
npm install axios
```

### Utilisation

#### 1. Importation du client API

```javascript
import * as API from './api';
```

#### 2. Authentification

```javascript
// Login
const { access, refresh } = await API.loginUser('user1', 'pass123');
localStorage.setItem('access_token', access);

// Récupérer profil
const user = await API.getCurrentUser();
console.log(user.role); // 'user' ou 'admin'
```

#### 3. Récupérer les Documents

```javascript
// Utilisateur: voit ses docs uniquement
const myDocs = await API.getDocuments();

// Admin: voir tous les docs
const allDocs = await API.getDocuments();  // Voit tout
```

#### 4. Hook React

```javascript
import { useAuth } from './hooks';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Chargement...</div>;
  if (!user) return <LoginForm />;
  
  return (
    <div>
      <h1>Bienvenue {user.email}</h1>
      <p>Rôle: {user.role === 'admin' ? 'Admin' : 'Utilisateur'}</p>
    </div>
  );
}
```

#### 5. Upload Document

```javascript
const formData = new FormData();
formData.append('nom_fichier', file);
formData.append('id_association', 1);
formData.append('id_type_document', 1);

await API.uploadDocument(formData);
```

### Composants fournis

- `useAuth()` - Gestion authentification
- `LoginForm` - Formulaire de connexion
- `DocumentsList` - Affichage des documents
- `DocumentUpload` - Uploader un document

---

## 🐳 Déploiement Docker

### Structure docker-compose.yml

```yaml
services:
  db:          # PostgreSQL
  backend:     # Django API
  frontend:    # React
```

### Commandes

```bash
# Démarrer
docker-compose up

# Arrêter
docker-compose down

# Logs
docker-compose logs -f backend

# Réinitialiser
docker-compose down -v
docker-compose up
```

### Ports

- `5432` - PostgreSQL
- `8000` - API Django
- `3000` - Frontend React

---

## 📚 Documentation Complète

### 1. **API_DOCUMENTATION.md**
Tous les endpoints, exemples de requêtes, modèles de données

### 2. **ROLES_AND_PERMISSIONS.md**
Détails du système de rôles, flux de sécurité, matrices de permissions

### 3. **IMPLEMENTATION_SUMMARY.md**
Résumé implémentation, quick start, vérifications de sécurité

---

## 🧪 Tests

```bash
# Lancer les tests
python manage.py test api.tests

# Avec coverage
coverage run --source='api' manage.py test
coverage report
```

Tests disponibles:
- ✅ Authentification
- ✅ Rôles et permissions
- ✅ Gestion documents
- ✅ Filtrage par rôle

---

## 🔍 Vérifications de Sécurité

✅ **Authentification JWT**
- Tokens signés et valides
- Expiration: 24h (access), 7j (refresh)
- Stockage client sécurisé

✅ **Permissions basées sur les rôles**
- Vérifiées côté serveur
- Pas de confiance au client
- Filtrage des données

✅ **Validation des données**
- Serializers Django
- Validation types
- Protection CSRF/CORS

✅ **Hachage des mots de passe**
- Bcrypt via Django
- Pas de stockage texte clair

---

## 📊 Modèles de Données

| Modèle | Champs | Clé |
|--------|--------|-----|
| **CustomUser** | id, email, username, password, role, is_active | id |
| **Association** | id_association, nom, ufr, statut, contact_info | id_association |
| **Membre** | id_membre, prenom, nom, email, statut | id_membre |
| **Document** | id_document, file, statut, date, id_assoc | id_document |
| **TypeDocument** | id_type, libelle, obligatoire | id_type_document |
| **Notification** | id_notif, sujet, message, date | id_notification |

---

## 🚨 Problèmes Courants

### "401 Unauthorized"
→ Token manquant ou expiré
```bash
POST /api/auth/refresh/  # Rafraîchir
```

### "403 Forbidden"
→ Permissions insuffisantes
- Vérifier le rôle
- Admin seulement pour certains endpoints

### "404 Not Found"
→ Ressource introuvable
- Vérifier l'ID
- Vérifier que l'accès est autorisé

---

## 📈 Prochaines Étapes

- [ ] Déploiement production
- [ ] Tests E2E automatisés
- [ ] Logging avancé
- [ ] Rate limiting
- [ ] Email notifications
- [ ] Search Elasticsearch
- [ ] API versioning

---

## 👨‍💻 Développement

### Structure du code

```
api/
├── models.py         # 6 modèles
├── serializers.py    # 7 serializers
├── views.py          # 6 viewsets (1500+ lignes)
├── permissions.py    # 5 classes permissions
├── urls.py           # Routes
└── admin.py          # Admin Django
```

### Conventions

- ✅ Noms en anglais pour code
- ✅ Commentaires en français pour logique complexe
- ✅ Docstrings pour chaque classe/fonction
- ✅ PEP 8 compliant

---

## 📞 Support

Pour des questions ou problèmes:

1. Consulter la documentation complète
2. Vérifier les logs: `docker-compose logs backend`
3. Tester avec Postman/cURL
4. Vérifier le JWT token: [jwt.io](https://jwt.io)

---

## 📝 License

MIT

---

**✨ API Ready!** Tous les endpoints sont fonctionnels et sécurisés. 🚀
