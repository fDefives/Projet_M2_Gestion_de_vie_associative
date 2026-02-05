# gestion_vie_associative
Plateforme pour gérer la vie associative à LRU

[![codecov](https://codecov.io/github/Urgaar/gestion_vie_associative/branch/dev/graph/badge.svg?token=8J851T2WNK)](https://codecov.io/github/Urgaar/gestion_vie_associative)

## 🏗️ Architecture Globale

[![](https://mermaid.ink/img/pako:eNqFVc1y0zAQfhWNeilTN9hx62IPw0zbUFp-QxrKDISDYq8TtbZlJBkITW_cucHAhRPvwPPwAvAISFbiOMYUX7xafd-udv2tfIlDFgEO8ISTfIqGB6MMqUcUY-M44iyTkEUvR_j3t0_ff_34WLnQ5gBIKNEWOqMSbozwK8PVz0M2oVmfTEDxKvv2mN-8s7lfyClkkoZEUpat0_ajlGY9IqaKVtljRnhkuPdAaBIieq9BFYKFS6q2aRn_XwFWiEaY_okKQHLaOReG4tpbSFWbM5pJsQ4-ZuxCKPhUvytCIUDXaCFl9FhYpLBGVLGM0ej0AQkvTKN_fv2i-7xwoM3eOckmDA3ung7X859ReKvzv9HvTj4z-b3SfwrN054CpySh74FrjlitKuaZckQtTekDT6kQyq-Z-WpVMQcH-4frnEdKVomGp6VRIRfFmO3_d6VHJBkTAaX-Pn_QfekzISccTp8-rHbXMj8TpsLDQkiW6pXJDCmhSflVeEZSsBBnCbSIyMhCrOvIhMhYaqEIRMhprr0WkrO8EaP65CrA0jbsmIZTCtxCQhJZSAvBu5zyln4_ZpLGiwHRYeprE0oU56ACpCCEGqzmMRrNrAYQbW_fmR8Ph300gNeFGoW51rsBVeN2LWg5ZNeByqkoAa2TUEMugvZPSrTWt17Mja7NZmmW2wtxwrwu5CbocArhxbwu2CbiaQF8Nl_or34M4ykxTwaP5kZG7Vt1mbQjqmrbt9c-cP0QZVK03VHA-8-HaMjUDdBSTv0ABn304K-k7aCW1BVvhaoVvxhIOUtgdfXHNEmCDc-JSDy2hOTqnMGG67pWyBLGgw3btuu85VVmaLbfha7dRovjuE5bjveC57renu_8k4ct9ROjEQ4kL8DCqWoa0Ut8qWOOsPrtpOqmCJQZQUyKRI7wKLtStJxkLxhLl0zOiskUBzFJhFoVuVZdjxJ1IaWVl6tygB-yIpM48Ny9MggOLvE7HPh2x3F2Hc_d6e7at3zPs_AMB47b2enu2Tu7ftfzHduznSsLvy_T2p1bqjLPt21_x3d2Pce7-gNn4ncS?type=png)](https://mermaid.live/edit#pako:eNqFVc1y0zAQfhWNeilTN9hx62IPw0zbUFp-QxrKDISDYq8TtbZlJBkITW_cucHAhRPvwPPwAvAISFbiOMYUX7xafd-udv2tfIlDFgEO8ISTfIqGB6MMqUcUY-M44iyTkEUvR_j3t0_ff_34WLnQ5gBIKNEWOqMSbozwK8PVz0M2oVmfTEDxKvv2mN-8s7lfyClkkoZEUpat0_ajlGY9IqaKVtljRnhkuPdAaBIieq9BFYKFS6q2aRn_XwFWiEaY_okKQHLaOReG4tpbSFWbM5pJsQ4-ZuxCKPhUvytCIUDXaCFl9FhYpLBGVLGM0ej0AQkvTKN_fv2i-7xwoM3eOckmDA3ung7X859ReKvzv9HvTj4z-b3SfwrN054CpySh74FrjlitKuaZckQtTekDT6kQyq-Z-WpVMQcH-4frnEdKVomGp6VRIRfFmO3_d6VHJBkTAaX-Pn_QfekzISccTp8-rHbXMj8TpsLDQkiW6pXJDCmhSflVeEZSsBBnCbSIyMhCrOvIhMhYaqEIRMhprr0WkrO8EaP65CrA0jbsmIZTCtxCQhJZSAvBu5zyln4_ZpLGiwHRYeprE0oU56ACpCCEGqzmMRrNrAYQbW_fmR8Ph300gNeFGoW51rsBVeN2LWg5ZNeByqkoAa2TUEMugvZPSrTWt17Mja7NZmmW2wtxwrwu5CbocArhxbwu2CbiaQF8Nl_or34M4ykxTwaP5kZG7Vt1mbQjqmrbt9c-cP0QZVK03VHA-8-HaMjUDdBSTv0ABn304K-k7aCW1BVvhaoVvxhIOUtgdfXHNEmCDc-JSDy2hOTqnMGG67pWyBLGgw3btuu85VVmaLbfha7dRovjuE5bjveC57renu_8k4ct9ROjEQ4kL8DCqWoa0Ut8qWOOsPrtpOqmCJQZQUyKRI7wKLtStJxkLxhLl0zOiskUBzFJhFoVuVZdjxJ1IaWVl6tygB-yIpM48Ny9MggOLvE7HPh2x3F2Hc_d6e7at3zPs_AMB47b2enu2Tu7ftfzHduznSsLvy_T2p1bqjLPt21_x3d2Pce7-gNn4ncS)

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

**L'authentification s'effectue avec l'username**


Le démarrage de l'application nécessite un .env à la racine du projet incluant la variable :
Un .env.example complet est disponible à la racine du projet pour vous aider à configurer les variables d'environnement nécessaires.

    DB_PASSWORD=postgres

```bash
docker-compose up --build

```
Front : http://localhost:3001/  
API : http://localhost:8000/api/docs/  pour test sur l'api  
Admin : http://localhost:8000/admin/ pour accès direct à Django 

### Générer une SECRET_KEY sécurisée

    python3 -c "import secrets; print(secrets.token_urlsafe(50))"

Copiez le résultat dans SECRET_KEY= de votre `.env 

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
- [`frontend/README.md`](frontend/README.md) - Guide frontend

## 📚 Documentation Complète

- [`backend/ROLES_AND_PERMISSIONS.md`](backend/ROLES_AND_PERMISSIONS.md) - Système de permissions détaillé
- [`VISUAL_GUIDE.md`](VISUAL_GUIDE.md) - Guide visuel étape par étape
- [`frontend/README.md`](frontend/README.md) - Guide frontend

## ⚠️ Problème de fin de ligne (Windows)

Si vous rencontrez des erreurs lors du lancement du Docker (problème avec `entrypoint.sh`), il faut modifier le format des fins de ligne :

1. Ouvrir le fichier `entrypoint.sh` dans VS Code
2. Cliquer sur **CRLF** en bas à droite
3. Sélectionner **LF**
4. Sauvegarder le fichier
5. Relancer le container Docker

> ℹ️ Ce problème n'affecte que les utilisateurs Windows avec VS Code 

