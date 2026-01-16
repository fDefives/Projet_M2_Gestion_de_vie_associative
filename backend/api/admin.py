from django.contrib import admin

from .models import (
    CustomUser,
    Association,
    AssociationType,
    Membre,
    TypeDocument,
    Document,
    Notification,
    Mandat,
    RoleType
)



# =========================
# USERS
# =========================
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    readonly_fields = ('created_at', 'updated_at', 'last_login')

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Profil', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions'
            )
        }),
        ('Dates', {
            'fields': ('last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# =========================
# ASSOCIATIONS
# =========================
@admin.register(Association)
class AssociationAdmin(admin.ModelAdmin):
    list_display = ['nom_association', 'association_type', 'statut', 'email_contact', 'created_at']
    list_filter = ['statut', 'association_type', 'created_at']
    search_fields = ['nom_association', 'email_contact']
    readonly_fields = ('date_creation_association', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': (
                'nom_association',
                'association_type',
                'id_utilisateur'
            )
        }),
        ('Informations', {
            'fields': (
                'ufr',
                'statut',
                'num_siret',
                'desc_association'
            )
        }),
        ('Contact', {
            'fields': (
                'email_contact',
                'tel_contact',
                'insta_contact'
            )
        }),
        ('Dates', {
            'fields': (
                'date_creation_association',
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )


@admin.register(AssociationType)
class AssociationTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')


# =========================
# MEMBRES
# =========================
@admin.register(Membre)
class MembreAdmin(admin.ModelAdmin):
    list_display = ('prenom', 'nom', 'email', 'statut_membre')
    list_filter = ('statut_membre',)
    search_fields = ['nom', 'prenom', 'email']
    readonly_fields = ('date_adhesion', 'created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('prenom', 'nom')}),
        ('Contact', {'fields': ('email', 'tel')}),
        ('Adhésion', {'fields': ('date_fin_adhesion', 'statut_membre')}),
        ('Dates', {
            'fields': ('date_adhesion', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# =========================
# TYPES DE RÔLE
# =========================
@admin.register(RoleType)
class RoleTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')


# =========================
# MANDATS
# =========================
@admin.register(Mandat)
class MandatAdmin(admin.ModelAdmin):
    list_display = (
        'membre',
        'association',
        'role_type',
        'statut',
        'date_debut',
        'date_fin'
    )
    list_filter = ('role_type', 'statut')


# =========================
# DOCUMENTS
# =========================
@admin.register(TypeDocument)
class TypeDocumentAdmin(admin.ModelAdmin):
    list_display = ['libelle', 'obligatoire', 'duree_validite_mois']
    list_filter = ['obligatoire']
    search_fields = ['libelle']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['nom_fichier', 'statut', 'id_association', 'date_depot', 'uploaded_by']
    list_filter = ['statut', 'date_depot', 'id_association']
    search_fields = ['nom_fichier', 'id_association__nom_association']
    readonly_fields = ['date_depot', 'created_at', 'updated_at']

    fieldsets = (
        (None, {'fields': ('nom_fichier', 'id_association', 'id_type_document')}),
        ('Statut', {'fields': ('statut', 'commentaire_refus')}),
        ('Dates', {'fields': ('date_depot', 'date_expiration')}),
        ('Utilisateur', {'fields': ('uploaded_by',), 'classes': ('collapse',)}),
        ('Métadonnées', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


# =========================
# NOTIFICATIONS
# =========================
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['sujet', 'type', 'id_association', 'date_envoi', 'is_read']
    list_filter = ['type', 'date_envoi', 'is_read']
    search_fields = ['sujet', 'message']
    readonly_fields = ['date_envoi', 'created_at']

    fieldsets = (
        (None, {'fields': ('sujet', 'message', 'id_association')}),
        ('Type', {'fields': ('type', 'is_read')}),
        ('Dates', {
            'fields': ('date_envoi', 'created_at'),
            'classes': ('collapse',)
        }),
    )
