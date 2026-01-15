# Adaptations Frontend - Mises à jour Base de Données

## Vue d'ensemble
Le frontend a été adapté pour refléter les changements de la structure de base de données, notamment l'introduction du système de mandats avec types de rôles.

## Changements principaux

### 1. **Nouveau modèle: RoleType**
- **Description**: Modèle pour gérer les types de rôles disponibles (Président, Trésorier, Secrétaire, etc.)
- **Champs**:
  - `id`: Identifiant unique
  - `name`: Nom du rôle (ex: "Président", "Trésorier")
  - `description`: Description du rôle
  - `created_at`: Date de création

### 2. **Modèle: Mandat (mise à jour)**
- **Changements**:
  - Ancien: Utilisait un champ `role` direct sur Mandat
  - Nouveau: Utilise une relation ForeignKey vers `RoleType`
  - Permet une meilleure gestion et réutilisation des rôles

- **Champs clés**:
  - `id_mandat`: Identifiant unique
  - `membre`: ForeignKey vers Membre
  - `association`: ForeignKey vers Association
  - `role_type`: ForeignKey vers RoleType (nouveau)
  - `statut`: active, termine, suspendu
  - `date_debut`: Date de début du mandat
  - `date_fin`: Date de fin (optionnel)

### 3. **Adapter l'API (api.js)**
Nouvelles fonctions ajoutées:
```javascript
// Gestion des types de rôles
- getRoleTypes()              // Récupère tous les types de rôles
- createRoleType(roleData)    // Crée un nouveau type de rôle

// Gestion des mandats
- getMandats()                // Récupère tous les mandats
- getAssociationMandats(id)   // Récupère les mandats d'une association
- createMandat(mandatData)    // Crée un mandat
- updateMandat(id, data)      // Met à jour un mandat
- deleteMandat(id)            // Supprime un mandat
```

### 4. **Composant: AssociationDetailView.tsx**

#### Interfaces mises à jour:
```typescript
interface RoleTypeData {
  id: number;
  name: string;
  description: string;
}

interface MandatData {
  id_mandat: number;
  membre: number;
  membre_detail?: MembreData;
  association: number;
  role_type: number;
  role_type_name?: string;
  statut: 'active' | 'termine' | 'suspendu';
  date_debut: string;
  date_fin: string | null;
}
```

#### Composant LeadersTab (refonte):
- **Ancien**: Affichait simplement une liste de membres avec rôles hardcodés
- **Nouveau**: 
  - Charge les mandats depuis l'API
  - Affiche les types de rôles depuis le serveur
  - Gère les mandats actifs et terminés séparément
  - Permet d'ajouter/modifier/supprimer des mandats

**Fonctionnalités**:
- Affichage des mandats actifs avec rôles, dates et statut
- Section "Mandats précédents" pour l'historique
- Bouton "Ajouter un mandat" (UI prête pour intégration)
- Gestion des erreurs et états de chargement

### 5. **Composant: DocumentsList.tsx**

#### Améliorations:
- Gestion améliorée des chemins d'accès aux données de l'association
- Support des structures imbriquées de l'API:
  - `association?.nom_association`
  - `nom_association` direct
- Meilleure gestion des types de documents
- Filtre de statut compatible avec les nouveaux statuts: `draft`, `submitted`, `approved`, `rejected`, `expired`

## Migration des données

### Structure des réponses API attendue

**GET /api/mandats/**
```json
{
  "results": [
    {
      "id_mandat": 1,
      "membre": 1,
      "association": 1,
      "role_type": 2,
      "statut": "active",
      "date_debut": "2026-01-15",
      "date_fin": null
    }
  ]
}
```

**GET /api/role-types/**
```json
{
  "results": [
    {
      "id": 1,
      "name": "Président",
      "description": "Chef de l'association"
    }
  ]
}
```

## Points importants

1. **Compatibilité**: Le frontend gère maintenant les rôles via le modèle RoleType centralisé
2. **Flexibilité**: Les types de rôles peuvent être créés dynamiquement au lieu d'être hardcodés
3. **Historique**: Les mandats terminés sont conservés et affichés séparément
4. **API**: Nouvelles routes `/api/role-types/` et `/api/mandats/` disponibles

## Fichiers modifiés

- `frontend/src/api.js` - Ajout des fonctions pour mandats et types de rôles
- `frontend/src/components/admin/AssociationDetailView.tsx` - Adaptation de LeadersTab
- `frontend/src/components/admin/DocumentsList.tsx` - Améliorations de gestion des données

## Tests recommandés

1. ✅ Vérifier que les mandats s'affichent correctement
2. ✅ Tester le filtre et la recherche dans DocumentsList
3. ✅ Vérifier les appels API avec les nouvelles routes
4. ✅ Tester l'ajout/modification/suppression de mandats
5. ✅ Vérifier les statuts de documents
