# gestion_vie_associative
Plateforme pour gérer la vie associative à LRU

[![codecov](https://codecov.io/github/Urgaar/gestion_vie_associative/branch/dev/graph/badge.svg?token=8J851T2WNK)](https://codecov.io/github/Urgaar/gestion_vie_associative)

## 📦 Composants Clés

### Frontend (`/frontend`)
- **src/api.js** - 30+ endpoints pour communiquer avec le backend
- **src/hooks.js** - Hooks React (useAuth, useDocuments, etc.)
- **src/components/** - Composants UI (LoginPage, AdminDashboard, AssociationDashboard)
- **src/lib/mockData.ts** - Données mockées pour tests

### Backend (`/backend`)
- **api/models.py** - Modèles Django (CustomUser, Association, Document, etc.)
- **api/views.py** - ViewSets REST (6 ViewSets, 550+ lignes)
- **api/serializers.py** - Serializers pour validation/transformation
- **api/permissions.py** - Logique de permissions RBAC
- **config/settings.py** - Configuration Django + JWT + CORS

### Base de Données (`PostgreSQL`)
```
CustomUser
├── email
├── username
├── is_staff (Admin flag)
└── role

Association
├── nom_association
├── id_utilisateur (FK)
├── description
└── type

Document
├── nom_fichier
├── id_association (FK)
├── uploaded_by (FK)
├── statut (draft/submitted/approved/rejected/expired)
└── date_expiration

Notification
├── sujet
├── message
├── id_association (FK)
└── type (info/warning/error/success)
```

## 🔐 Système de Permissions (RBAC)

```
┌─────────────────────────────────────────┐
│         ROLE-BASED ACCESS CONTROL       │
└─────────────────────────────────────────┘

ADMIN (is_staff=True)
├── GET    /associations/          → Toutes les associations
├── POST   /associations/          → Créer association
├── GET    /documents/             → Tous les documents
├── PATCH  /documents/{id}/approve → Approuver documents
├── PATCH  /documents/{id}/reject  → Rejeter documents
└── GET    /users/                 → Tous les utilisateurs

USER (is_staff=False)
├── GET    /associations/          → Son association uniquement
├── GET    /documents/             → Ses documents uniquement
├── POST   /documents/             → Uploader document
├── GET    /notifications/         → Ses notifications
└── PATCH  /documents/{id}/        → Modifier son document
```

## 🚀 Démarrage de l'Application

### Option 1: Docker (Recommandé)
```bash
docker-compose up --build
# Front : http://localhost:3001/
# API : http://localhost:8000/
# Admin : http://localhost:8000/admin/
```

### Option 2: Local
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py init_full_data
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## 📊 Technologies Utilisées

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool & dev server
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - REST API
- **djangorestframework-simplejwt** - JWT authentication
- **PostgreSQL 15** - Database
- **django-cors-headers** - CORS handling

### DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD

## 📚 Documentation Complète

- [`backend/ROLES_AND_PERMISSIONS.md`](backend/ROLES_AND_PERMISSIONS.md) - Système de permissions détaillé
- [`VISUAL_GUIDE.md`](VISUAL_GUIDE.md) - Guide visuel étape par étape
- [`frontend/README.md`](frontend/README.md) - Guide frontend

## 🧪 Tests



**Figma**: https://www.figma.com/files/team/1589991964439481275/
**Docs**: https://docs.google.com/document/d/1bmRo8PIGphW91MOroWBuFODpw0Fkq1x-y7niN5SgrSs/