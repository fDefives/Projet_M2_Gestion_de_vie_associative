# API Gestion Vie Associative

## Description

API Django REST pour la gestion complète des associations avec un système de rôles sécurisé:
- **Admin**: Accès complet à toutes les données
- **Utilisateur**: Accès limité à sa propre association et ses documents

## Installation

### Dépendances
```bash
pip install -r requirements.txt
```

## Configuration

### Variables d'environnement

```env
DB_NAME=gestion_associative
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
```

## Lancer l'application

### Migrations
```bash
python manage.py migrate
```

### Initialiser les données de test
```bash
python manage.py init_db
```

### Démarrer le serveur
```bash
python manage.py runserver
```

L'API est accessible sur `http://localhost:8000/api/`

## Authentification

### Obtenir les tokens JWT

**Endpoint**: `POST /api/auth/login/`

**Payload**:
```json
{
  "username": "user1",
  "password": "pass123"
}
```

**Réponse**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Utiliser le token

Inclure dans chaque requête:
```
Authorization: Bearer <access_token>
```

### Rafraîchir le token

**Endpoint**: `POST /api/auth/refresh/`

**Payload**:
```json
{
  "refresh": "<refresh_token>"
}
```

## Endpoints Disponibles

### Utilisateurs

- `POST /api/users/register/` - Enregistrer un nouvel utilisateur
- `GET /api/users/me/` - Obtenir le profil de l'utilisateur connecté
- `GET /api/users/` - Liste tous les utilisateurs (Admin seulement)

### Associations

- `GET /api/associations/` - Liste des associations
- `POST /api/associations/` - Créer une association
- `GET /api/associations/{id}/` - Détails d'une association
- `GET /api/associations/{id}/documents/` - Documents de l'association
- `GET /api/associations/{id}/members/` - Membres de l'association

### Membres

- `GET /api/membres/` - Liste des membres
- `POST /api/membres/` - Ajouter un membre
- `GET /api/membres/{id}/` - Détails d'un membre
- `PATCH /api/membres/{id}/` - Modifier un membre
- `DELETE /api/membres/{id}/` - Supprimer un membre

### Documents (Cœur du système de rôles)

#### Pour les utilisateurs:
- `GET /api/documents/` - Voir ses documents uniquement
- `POST /api/documents/` - Ajouter un document
- `PATCH /api/documents/{id}/` - Modifier son document
- `DELETE /api/documents/{id}/` - Supprimer son document
- `GET /api/documents/my_documents/` - Ses propres documents

#### Pour les admins:
- `GET /api/documents/` - Voir tous les documents
- `GET /api/documents/by_association/?association_id=1` - Documents d'une association
- `GET /api/documents/by_status/?status=approved` - Documents par statut
- `PATCH /api/documents/{id}/approve/` - Approuver un document
- `PATCH /api/documents/{id}/reject/` - Rejeter un document

### Types de Documents

- `GET /api/type-documents/` - Liste des types
- `POST /api/type-documents/` - Créer un type (Admin)
- `GET /api/type-documents/{id}/` - Détails
- `PATCH /api/type-documents/{id}/` - Modifier (Admin)
- `DELETE /api/type-documents/{id}/` - Supprimer (Admin)

### Notifications

- `GET /api/notifications/` - Voir ses notifications
- `GET /api/notifications/unread/` - Notifications non lues
- `POST /api/notifications/mark_as_read/` - Marquer comme lues
- `GET /api/notifications/{id}/` - Détails
- `PATCH /api/notifications/{id}/` - Modifier

## Logique des Rôles

### Admin
- ✅ Voir tous les documents de toutes les associations
- ✅ Approuver/Rejeter les documents
- ✅ Accéder à tous les utilisateurs et associations
- ✅ Gérer les types de documents

### Utilisateur
- ✅ Voir uniquement les documents de son association
- ✅ Ajouter des documents
- ✅ Modifier/Supprimer ses propres documents
- ❌ Ne voit pas les documents des autres associations
- ❌ Ne peut pas approuver/rejeter

## Modèles de Données

### CustomUser
```python
- id (primary key)
- email (unique)
- username
- password (hashé)
- role: admin ou user
- is_active
- created_at
- updated_at
```

### Association
```python
- id_association (primary key)
- nom_association
- date_creation_association
- ufr
- statut: active, inactive, suspended
- email_contact, tel_contact, insta_contact
- id_utilisateur (ForeignKey vers CustomUser)
```

### Membre
```python
- id_membre (primary key)
- prenom, nom
- email, tel
- date_adhesion
- statut_membre: active, inactive, pending
- date_fin_adhesion
- id_association (ForeignKey vers Association)
```

### Document
```python
- id_document (primary key)
- nom_fichier (upload)
- date_depot
- date_expiration
- statut: draft, submitted, approved, rejected, expired
- commentaire_refus
- id_association (ForeignKey)
- id_type_document (ForeignKey)
- uploaded_by (ForeignKey vers CustomUser)
```

### TypeDocument
```python
- id_type_document (primary key)
- libelle (unique)
- obligatoire (boolean)
- duree_validite_mois
```

### Notification
```python
- id_notification (primary key)
- date_envoi
- sujet
- message
- type: info, warning, error, success
- id_association (ForeignKey)
- is_read (boolean)
```

## Exemples d'Utilisation

### 1. Créer un compte utilisateur

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "Jean",
    "last_name": "Dupont"
  }'
```

### 2. Se connecter

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "securepass123"
  }'
```

### 3. Créer une association

```bash
curl -X POST http://localhost:8000/api/associations/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nom_association": "Club Tech ULR",
    "ufr": "UFR Sciences",
    "email_contact": "contact@clubtech.fr",
    "tel_contact": "01234567890"
  }'
```

### 4. Ajouter un document (Utilisateur)

```bash
curl -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer <user_token>" \
  -F "nom_fichier=@statuts.pdf" \
  -F "id_association=1" \
  -F "id_type_document=1"
```

### 5. Approuver un document (Admin)

```bash
curl -X PATCH http://localhost:8000/api/documents/1/approve/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

## Sécurité

- ✅ Authentification JWT avec expiration
- ✅ Permissions basées sur les rôles (RBAC)
- ✅ Validation des données (serializers)
- ✅ CORS configuré pour React
- ✅ Hachage sécurisé des mots de passe

## Intégration React

### Configuration CORS

Le frontend React sur `http://localhost:3000` a accès à l'API.

### Exemple React

```javascript
// Login
const response = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'user1', password: 'pass123'})
});
const data = await response.json();
localStorage.setItem('access_token', data.access);

// Récupérer les documents
const docs = await fetch('http://localhost:8000/api/documents/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
const documents = await docs.json();
```

## Support

Pour toute question, veuillez consulter la documentation Django REST Framework:
https://www.django-rest-framework.org/
