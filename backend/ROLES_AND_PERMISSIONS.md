# Système de Rôles et Permissions

## Vue d'ensemble

L'API implémente un système de contrôle d'accès basé sur les rôles (RBAC) avec **2 rôles principaux**:
1. **Admin** - Accès complet à toutes les ressources
2. **User** (Utilisateur) - Accès limité à ses propres données

## Détails des Rôles

### 👨‍💼 Administrateur (Admin)

#### Permissions:
- ✅ Voir **tous les documents** de **toutes les associations**
- ✅ **Approuver/Rejeter** les documents soumis
- ✅ Accéder à **tous les utilisateurs** et leurs profils
- ✅ Gérer les **types de documents**
- ✅ Voir **toutes les associations** et leurs membres
- ✅ Créer/Modifier/Supprimer n'importe quel document
- ✅ Créer des **notifications** pour toutes les associations

#### Endpoints spécifiques (Admin):
```
GET    /api/documents/
GET    /api/documents/by_association/?association_id=1
GET    /api/documents/by_status/?status=approved
PATCH  /api/documents/{id}/approve/
PATCH  /api/documents/{id}/reject/
DELETE /api/documents/{id}/

GET    /api/users/         (Liste tous les utilisateurs)
GET    /api/associations/  (Voir toutes les associations)
GET    /api/membres/       (Voir tous les membres)

POST   /api/type-documents/
PATCH  /api/type-documents/{id}/
DELETE /api/type-documents/{id}/
```

### 👤 Utilisateur Standard (User)

#### Permissions:
- ✅ Voir **uniquement ses documents** (de son association)
- ✅ **Ajouter** de nouveaux documents
- ✅ **Modifier/Supprimer** ses propres documents uniquement
- ✅ Voir les **informations de son association**
- ✅ Voir les **membres de son association**
- ✅ Voir les **notifications** de son association
- ❌ **NE PEUT PAS** voir les documents d'autres associations
- ❌ **NE PEUT PAS** approuver/rejeter les documents
- ❌ **NE PEUT PAS** accéder aux données d'autres utilisateurs

#### Endpoints accessibles (User):
```
GET    /api/documents/          (Ses documents uniquement)
GET    /api/documents/my_documents/
POST   /api/documents/
PATCH  /api/documents/{id}/     (Son propre document)
DELETE /api/documents/{id}/     (Son propre document)

GET    /api/associations/       (Son association)
GET    /api/associations/{id}/documents/
GET    /api/associations/{id}/members/

GET    /api/membres/            (Membres de son association)
POST   /api/membres/            (Ajouter un membre)

GET    /api/notifications/      (Ses notifications)
GET    /api/notifications/unread/
POST   /api/notifications/mark_as_read/
```

## Flux de Sécurité

### 1. Authentification

```mermaid
[Utilisateur]
    |
    v
[POST /api/auth/login/]
    |
    +-- Valide credentials
    |
    v
[Retourne JWT Token]
    |
    v
[Stocké dans localStorage]
```

**Processus:**
1. Utilisateur envoie `username` et `password`
2. Django valide les identifiants
3. JWT token retourné (access + refresh)
4. Token stocké côté client
5. Token inclus dans `Authorization: Bearer <token>` pour chaque requête

### 2. Vérification de Rôle

À chaque requête:
1. Middleware vérifie le JWT token
2. Récupère l'utilisateur associé
3. Extrait le rôle (`role: 'admin'` ou `role: 'user'`)
4. Applique les permissions correspondantes

### 3. Filtrage des Données par Rôle

**Pour les documents:**

```python
def get_queryset(self):
    user = self.request.user
    
    if user.role == 'admin':
        # Admin voit TOUS les documents
        return Document.objects.all()
    
    # User voit UNIQUEMENT les documents de son association
    return Document.objects.filter(
        id_association__id_utilisateur=user
    )
```

## Contrôle d'Accès Détaillé

### Documents - Logique Spécifique

| Opération | Admin | User | Visiteur |
|-----------|-------|------|----------|
| Voir tous les documents | ✅ | ❌ | ❌ |
| Voir ses documents | ✅ | ✅ | ❌ |
| Ajouter un document | ✅ | ✅ | ❌ |
| Modifier son document | ✅ | ✅ | ❌ |
| Modifier un document d'un autre | ✅ | ❌ | ❌ |
| Supprimer son document | ✅ | ✅ | ❌ |
| Supprimer un document d'un autre | ✅ | ❌ | ❌ |
| Approuver un document | ✅ | ❌ | ❌ |
| Rejeter un document | ✅ | ❌ | ❌ |

### Associations

| Opération | Admin | User |
|-----------|-------|------|
| Voir toutes les associations | ✅ | ❌ |
| Voir sa propre association | ✅ | ✅ |
| Créer une association | ✅ | ✅ |
| Modifier sa propre association | ✅ | ✅ |
| Modifier une autre association | ✅ | ❌ |

### Utilisateurs

| Opération | Admin | User |
|-----------|-------|------|
| Voir tous les utilisateurs | ✅ | ❌ |
| Voir son profil | ✅ | ✅ |
| Modifier son profil | ✅ | Partiel |
| Voir les profils d'autres | ✅ | ❌ |

## Implémentation des Permissions

### Fichier: `api/permissions.py`

```python
class IsAdmin(permissions.BasePermission):
    """Seul l'admin peut accéder"""
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class IsAssociationMemberOrAdmin(permissions.BasePermission):
    """Voir ses données ou admin voit tout"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.id_association.id_utilisateur == request.user

class IsDocumentOwnerOrAdmin(permissions.BasePermission):
    """Propriétaire ou admin"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.id_association.id_utilisateur == request.user
```

### Utilisation dans les Views

```python
class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticated,
        IsDocumentOwnerOrAdmin
    ]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Document.objects.all()
        return Document.objects.filter(
            id_association__id_utilisateur=user
        )
```

## Flux d'Utilisation - Exemple Concret

### Scénario: Utilisateur télécharge un document

```
1. Utilisateur se connecte
   POST /api/auth/login/
   ← Token JWT reçu

2. Ajoute un document
   POST /api/documents/
   Headers: Authorization: Bearer <token>
   Body: {file, association_id, type_id}
   
   Backend:
   ✓ Vérifie le token JWT
   ✓ Extrait l'utilisateur et le rôle
   ✓ Valide que l'utilisateur a accès à l'association
   ✓ Crée le document avec uploaded_by = user
   ✓ Retourne le document créé

3. Récupère ses documents
   GET /api/documents/
   Headers: Authorization: Bearer <token>
   
   Backend:
   ✓ Vérifie le token et le rôle
   ✓ Si user: retourne UNIQUEMENT ses documents
   ✓ Si admin: retourne TOUS les documents

4. Supprime son document
   DELETE /api/documents/1/
   Headers: Authorization: Bearer <token>
   
   Backend:
   ✓ Vérifie permissions: IsDocumentOwnerOrAdmin
   ✓ User peut supprimer que s'il en est propriétaire
   ✓ Admin peut supprimer n'importe lequel
```

### Scénario: Admin approuve un document

```
1. Admin se connecte
   POST /api/auth/login/
   ← Token JWT avec role='admin'

2. Voir tous les documents
   GET /api/documents/
   ← Retourne TOUS les documents de TOUTES les associations

3. Approuver un document
   PATCH /api/documents/5/approve/
   
   Backend:
   ✓ Vérifie que user.role == 'admin'
   ✓ Change statut à 'approved'
   ✓ Retourne le document modifié
```

## Détails Techniques

### Token JWT

La payload JWT contient:
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "user",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Vérification Requis

- **Token valide**: Doit être dans l'en-tête `Authorization: Bearer <token>`
- **Token non expiré**: Contrôlé automatiquement par SimplJWT
- **Utilisateur actif**: L'utilisateur doit avoir `is_active=True`
- **Rôle correct**: Vérifié pour chaque action

## Gestion des Erreurs

| Erreur | Code HTTP | Cause |
|--------|-----------|-------|
| Token invalide/manquant | 401 | Pas d'authentification |
| Permission refusée | 403 | Rôle insuffisant |
| Ressource introuvable | 404 | ID invalide |
| Données invalides | 400 | Validation échouée |
| Conflit | 409 | Données en conflit |

## Scénarios d'Utilisation Recommandés

### Pour une Application Multi-Association

1. **Admin gère une association maître** qui valide les documents
2. **Présidents d'association** = Users avec leur propre association
3. **Admin voit tout** pour supervision globale
4. **Users voient que leurs données** pour confidentialité

### Flux Type:

```
Président Association
    ├─ Crée son association
    ├─ Ajoute des membres
    ├─ Upload documents (Statuts, Assurance, Budget)
    └─ Attend approbation admin

Admin
    ├─ Voit tous les documents en attente
    ├─ Approuve les conformes
    ├─ Rejette les non-conformes avec commentaire
    └─ Archive les documents approuvés
```

## Sécurité - Points Clés

1. **Pas de confiance au client**: Toutes les vérifications côté serveur
2. **Token JWT**: Signé et non modifiable par le client
3. **Filtrage des données**: Chaque requête filtre par rôle
4. **Audit trail**: `created_at`, `updated_at`, `uploaded_by` tracent les actions
5. **Validation complète**: Tous les inputs validés via serializers

## Extension Future

Pour ajouter d'autres rôles:

```python
# Modèle
role = models.CharField(
    max_length=20,
    choices=[
        ('admin', 'Admin'),
        ('user', 'User'),
        ('moderator', 'Modérateur'),  # Nouveau
        ('viewer', 'Lecteur'),         # Nouveau
    ]
)

# Permission
class IsModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'moderator'

# Utilisation
permission_classes = [IsModerator]
```
