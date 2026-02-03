# Architecture Frontend - Gestion Vie Associative

## Vue d'ensemble

Le frontend est une application React en TypeScript utilisant Vite comme bundler. Elle gère l'authentification et deux interfaces distinctes : une pour les administrateurs et une pour les responsables d'associations.

## Structure du projet

### Vue hiérarchique (Mermaid)

```mermaid
flowchart LR
   src[frontend/src]

   subgraph Core[Core]
      App[App.tsx]
      Main[main.tsx]
      Api[api.js]
      Hooks[hooks.js]
      Css[index.css]
   end

   subgraph Components[components/]
      Pages[Pages]
      Admin[admin/]
      Shared[shared/]
      Figma[figma/]
      Ui[ui/]
   end

   subgraph Styles[styles/]
      Globals[globals.css]
   end

   src --> Core
   src --> Components
   src --> Styles

   Pages --> Login[LoginPage.tsx]
   Pages --> Reset[ResetPasswordPage.tsx]
   Pages --> AdminDash[AdminDashboard.tsx]
   Pages --> UserDash[AssociationDashboard.tsx]

   Admin --> Detail[AssociationDetailView.tsx]
   Admin --> AssocList[AssociationsList.tsx]
   Admin --> DocsList[DocumentsList.tsx]
   Admin --> Stats[StatsOverview.tsx]
   Admin --> Mandats[MandatsManager.tsx]
   Admin --> Settings[SettingsPanel.tsx]
   Admin --> AdminTabs[tabs/]
   Admin --> AdminModals[modals/]

   AdminTabs --> OverviewTab[OverviewTab.tsx]
   AdminTabs --> DocumentsTab[DocumentsTab.tsx]
   AdminTabs --> LeadersTab[LeadersTab.tsx]

   AdminModals --> UploadDoc[UploadDocumentModal.tsx]
   AdminModals --> EditAssoc[EditAssociationModal.tsx]

   Shared --> Badge[DocumentStatusBadge.tsx]
   Shared --> SharedModals[modals/]
   SharedModals --> UserUpload[UserUploadDocumentModal.tsx]
   SharedModals --> UserEdit[UserEditAssociationModal.tsx]
   SharedModals --> UserSettings[UserSettingsModal.tsx]

   Figma --> Img[ImageWithFallback.tsx]
   Ui --> Shadcn[[shadcn/ui components]]
```

### Vue détaillée (arborescence)

```
frontend/src/
├── App.tsx                          # Point d'entrée principal (routing)
├── main.tsx                         # Bootstrap React
├── api.js                           # Client HTTP (Axios) + endpoints API
├── hooks.js                         # Custom hooks React
├── index.css                        # Styles globaux
├── components/
│   ├── LoginPage.tsx               # Page de connexion
│   ├── ResetPasswordPage.tsx        # Page de réinitialisation mot de passe
│   ├── AdminDashboard.tsx           # Dashboard admin (parent)
│   ├── AssociationDashboard.tsx     # Dashboard utilisateur (parent)
│   ├── admin/
│   │   ├── AssociationDetailView.tsx    # Détail d'une association (tabs)
│   │   ├── AssociationsList.tsx         # Liste des associations
│   │   ├── DocumentsList.tsx            # Liste des documents globale
│   │   ├── StatsOverview.tsx            # Vue d'ensemble statistiques
│   │   ├── MandatsManager.tsx           # Gestion des mandats
│   │   ├── SettingsPanel.tsx            # Paramètres système (types, rôles)
│   │   ├── tabs/
│   │   │   ├── OverviewTab.tsx          # Onglet aperçu association
│   │   │   ├── DocumentsTab.tsx         # Onglet documents
│   │   │   └── LeadersTab.tsx           # Onglet mandats/leaders
│   │   └── modals/
│   │       ├── UploadDocumentModal.tsx  # Upload document (admin)
│   │       └── EditAssociationModal.tsx # Édition association (admin)
│   ├── shared/
│   │   ├── DocumentStatusBadge.tsx      # Composant badge statut document
│   │   └── modals/
│   │       ├── UserUploadDocumentModal.tsx     # Upload document (user)
│   │       ├── UserEditAssociationModal.tsx    # Édition association (user)
│   │       └── UserSettingsModal.tsx           # Paramètres utilisateur
│   ├── figma/
│   │   └── ImageWithFallback.tsx        # Composant image avec fallback
│   └── ui/
│       └── [composants shadcn/ui]       # UI library (inputs, dialogs, etc.)
└── styles/
      └── globals.css                  # Styles Tailwind
```

## Architecture des composants

### Hiérarchie de rendu (Mermaid)

```mermaid
flowchart TB
   App[App.tsx]
   Router[Router / Routes]
   Login[LoginPage]
   Admin[AdminDashboard]
   UserDash[AssociationDashboard]

   App --> Router
   Router --> Login
   Router --> Admin
   Router --> UserDash

   Admin --> Sidebar[Sidebar]
   Admin --> Stats[StatsOverview]
   Admin --> AssocList[AssociationsList]
   AssocList --> Detail[AssociationDetailView]
   Detail --> OverviewTab[OverviewTab]
   Detail --> DocumentsTab[DocumentsTab]
   Detail --> LeadersTab[LeadersTab]
   Admin --> DocsList[DocumentsList]
   Admin --> Settings[SettingsPanel]
   Admin --> AdminModals[Modals Admin]
   AdminModals --> UploadDoc[UploadDocumentModal]
   AdminModals --> EditAssoc[EditAssociationModal]

   UserDash --> Header[Header (email + settings)]
   UserDash --> UserTabs[Tabs (overview, documents, leaders)]
   UserDash --> UserModals[Modals User]
   UserModals --> UserUpload[UserUploadDocumentModal]
   UserModals --> UserEdit[UserEditAssociationModal]
   UserModals --> UserSettings[UserSettingsModal]
```

### Flux de données (Mermaid)

```mermaid
flowchart LR
   UI[Composants UI] --> API[api.js (Axios)]
   API --> Auth[Authentication]
   API --> Assoc[Associations]
   API --> Docs[Documents]
   API --> Members[Membres]
   API --> Mandats[Mandats]
   API --> Profile[User Profile]

   Auth --> login[loginUser()]
   Auth --> current[getCurrentUser()]
   Auth --> logout[logout()]
   Auth --> reset[resetPassword()]

   Assoc --> getAssoc[getAssociations()]
   Assoc --> getDetails[getAssociationDetails()]
   Assoc --> createAssoc[createAssociation()]
   Assoc --> updateAssoc[updateAssociation()]

   Docs --> getDocs[getDocuments()]
   Docs --> upload[uploadDocument()]
   Docs --> approve[approveDocument()]
   Docs --> reject[rejectDocument()]
   Docs --> updateDoc[updateDocument()]

   Members --> getMembers[getAssociationMembers()]
   Members --> createMember[createMembre()]

   Mandats --> getMandats[getAssociationMandats()]
   Mandats --> createMandat[createMandat()]
   Mandats --> deleteMandat[deleteMandat()]

   Profile --> updateProfile[updateUserProfile()]
   Profile --> changePassword[changeUserPassword()]
```

## Types de composants

### 1. **Composants de page (Pages)**
- `LoginPage.tsx` - Formulaire de connexion
- `AdminDashboard.tsx` - Dashboard principal admin
- `AssociationDashboard.tsx` - Dashboard principal utilisateur
- `ResetPasswordPage.tsx` - Réinitialisation mot de passe

### 2. **Composants de conteneur (Containers)**
- `AssociationDetailView.tsx` - Conteneur pour détail association
- `StatsOverview.tsx` - Conteneur pour statistiques
- `AssociationsList.tsx` - Conteneur pour liste associations
- `DocumentsList.tsx` - Conteneur pour liste documents

### 3. **Composants d'onglets (Tabs)**
- `OverviewTab.tsx` - Aperçu association (stats, infos, membres)
- `DocumentsTab.tsx` - Gestion documents
- `LeadersTab.tsx` - Gestion mandats/leaders

### 4. **Composants de modale (Modals)**
- **Admin modals:**
  - `UploadDocumentModal.tsx` - Upload document
  - `EditAssociationModal.tsx` - Édition association
- **User/Shared modals:**
  - `UserUploadDocumentModal.tsx` - Upload document (user)
  - `UserEditAssociationModal.tsx` - Édition association (user)
  - `UserSettingsModal.tsx` - Paramètres utilisateur (email/password)

### 5. **Composants utilitaires (Utils)**
- `DocumentStatusBadge.tsx` - Badge statut document
- `ImageWithFallback.tsx` - Image avec fallback

### 6. **Composants UI (UI Library)**
- Shadcn/ui components (Button, Input, Dialog, Tabs, etc.)
- Icones lucide-react

## Flux d'authentification (Mermaid)

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant L as LoginPage
  participant API as api.js
  participant B as Backend
  participant A as App.tsx

  U->>L: Saisit email/mot de passe
  L->>API: loginUser(email, password)
  API->>B: POST /login
  B-->>API: access_token + refresh_token
  API-->>L: succès
  L->>A: setCurrentUser()
  A->>API: getCurrentUser()
  API->>B: GET /users/me
  B-->>API: user + role
  A-->>U: Route AdminDashboard ou AssociationDashboard
```

## Gestion d'état

### État global (App.tsx)
- `currentUser` - Utilisateur connecté
- `loading` - État de chargement initial

### État local (par composant)
- Chaque page/conteneur gère son propre état
- Les modals gèrent leur propre formulaire

### Persistance
- Tokens JWT stockés dans `localStorage`
- Refonte automatique via intercepteur Axios

## Patterns utilisés

### 1. **Custom Hooks**
- `useAuth()` - Gestion authentification (hooks.js)

### 2. **Composants contrôlés**
- Les formulaires utilisent `useState` pour chaque champ
- Validation côté client avant envoi API

### 3. **Composition**
- Les composants parents passent les données par props
- Les enfants remontent les événements par callbacks

### 4. **Conditionnels**
- Affichage basé sur le rôle (admin vs user)
- Affichage basé sur l'état des données

## Stylisation

- **Tailwind CSS** - Framework CSS utilitaire
- **Tailwind plugins** - Border radius, spacing custom
- **Composants shadcn/ui** - Composants pré-stylisés

## Exemple de flux: Créer une association (Admin)

```mermaid
sequenceDiagram
   participant Admin as AdminDashboard
   participant Modal as EditAssociationModal
   participant API as api.js
   participant B as Backend

   Admin->>Modal: Ouvre la modale
   Admin->>Modal: Remplit le formulaire
   Modal->>API: createAssociation(payload)
   API->>B: POST /associations
   B-->>API: 201 Created
   API-->>Admin: succès
   Admin-->>Admin: rafraîchit la liste
```

## Exemple de flux: Uploader un document (User)

```mermaid
sequenceDiagram
   participant User as AssociationDashboard
   participant Modal as UserUploadDocumentModal
   participant API as api.js
   participant B as Backend

   User->>Modal: Ouvre la modale
   User->>Modal: Sélectionne type/date/fichier
   Modal->>API: uploadDocument(formData)
   API->>B: POST /documents
   B-->>API: 201 Created
   API-->>User: succès
   User-->>User: rafraîchit la liste
```

## Sécurité

- **JWT Bearer Token** - Autorisation sur chaque requête
- **localStorage** - Stockage tokens (à considérer pour httpOnly cookies en production)
- **Intercepteurs Axios** - Gestion erreurs 401, refresh token
- **Validation côté client** - Email, SIRET, téléphone
- **Permissions** - Contrôlées par backend (role admin vs user)

## Performance

- **Lazy loading** - Routes React lazy loaded
- **Optimisation images** - ImageWithFallback
- **Pagination** - Listes avec pagination backend
- **Caching** - localStorage pour tokens + user info