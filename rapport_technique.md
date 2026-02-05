# Rapport technique

## Documentation orientée client

Ce projet a pour but de réaliser une application web de gestion de documents pour des associations. L'application se divise en deux vues principales : la vue Association et la vue Admin. La vue Association permet aux utilisateurs de soumettre, consulter et gérer leurs documents, tandis que la vue Admin offre aux administrateurs la possibilité d'approuver ou de rejeter ces documents, ainsi que de gérer les utilisateurs et les associations.

### Fonctionnalités principales
- **Gestion des utilisateurs** : Inscription, connexion, et gestion des profils utilisateurs.
- **Gestion des associations** : Création et gestion des associations.
- **Gestion des documents** : Upload, consultation, modification, approbation et rejet des documents.
- **Notifications** : Système de notifications pour informer les utilisateurs des changements d'état de leurs documents.

### Vue Association
La vue Association permet aux utilisateurs de :
- Déposer leurs documents pour approbation.
- Actualiser les informations de leurs membres.
- Mettre à jour leurs propres informations personnelles.

Cette interface est conçue pour être intuitive, facilitant la gestion des documents et des membres au sein de l'association.

### Vue Admin
La vue Admin offre aux administrateurs les fonctionnalités suivantes :
- Visualiser toutes les associations enregistrées dans le système.
- Mettre à jour les informations de tous les utilisateurs et associations.
- Créer des comptes pour de nouveaux utilisateurs, leur attribuant des rôles appropriés.

Cette vue est essentielle pour assurer une gestion efficace et centralisée des opérations au sein de l'application.

### Système de permissions (RBAC)
Le système de permissions est basé sur le rôle des utilisateurs (administrateurs et utilisateurs standards). Les administrateurs ont des droits étendus pour gérer les associations et les documents, tandis que les utilisateurs standards peuvent uniquement gérer leurs propres documents et consulter les informations de leur association.

## Documentation technique

**On utilise le username pour se connecter et pas l'email.**

### Démarrer l'appli

<a href="README.md">README.md</a>


### La documentation du frontend

<a href="ARCHITECTURE_FRONTEND.md">ARCHITECTURE_FRONTEND.md</a>

### La documentation du backend
- [`backend/ROLES_AND_PERMISSIONS.md`](backend/ROLES_AND_PERMISSIONS.md) 
- Système de permissions détaillé et fonctionnement du backend



