# Rapport technique

## Documentation orientée client

Ce projet a pour but de réaliser une application web de gestion de documents pour des associations. L'application permet aux utilisateurs de soumettre, consulter et gérer des documents, tandis que les administrateurs peuvent approuver ou rejeter ces documents.
### Fonctionnalités principales
- **Gestion des utilisateurs** : Inscription, connexion, et gestion des profils utilisateurs.
- **Gestion des associations** : Création et gestion des associations.
- **Gestion des documents** : Upload, consultation, modification, approbation et rejet des documents.
- **Notifications** : Système de notifications pour informer les utilisateurs des changements d'état de leurs documents.
### Système de permissions (RBAC)
Le système de permissions est basé sur le rôle des utilisateurs (administrateurs et utilisateurs standards). Les administrateurs ont des droits étendus pour gérer les associations et les documents, tandis que les utilisateurs standards peuvent uniquement gérer leurs propres documents et consulter les informations de leur association.

## Documentation technique

**On utilise le username pour se connecter et pas l'email.**

### Démarrer l'appli

<a href="README.md">README.md</a>


### La documentation du frontend

<a href="ARCHITECTURE_FRONTEND.md">ARCHITECTURE_FRONTEND.md</a>

### La documentation du backend

<a href="VISUAL_GUIDE.md">VISUAL_GUIDE.md</a>
