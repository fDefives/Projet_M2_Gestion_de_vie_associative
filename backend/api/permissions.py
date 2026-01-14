from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission pour les administrateurs uniquement"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsUser(permissions.BasePermission):
    """Permission pour les utilisateurs standards"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'user'


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission pour voir, les admins peuvent modifier"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsAssociationMemberOrAdmin(permissions.BasePermission):
    """Permission pour accéder aux documents de son association"""
    def has_object_permission(self, request, view, obj):
        # Admin voit tout
        if request.user.role == 'admin':
            return True
        
        # Utilisateur ne voit que ses documents
        if hasattr(obj, 'id_association'):
            return obj.id_association.id_utilisateur == request.user
        
        return False


class IsDocumentOwnerOrAdmin(permissions.BasePermission):
    """Permission pour les documents - propriétaire ou admin"""
    def has_object_permission(self, request, view, obj):
        # Admin peut tout faire
        if request.user.role == 'admin':
            return True
        
        # Utilisateur ne peut modifier/supprimer que ses documents
        return obj.id_association.id_utilisateur == request.user
