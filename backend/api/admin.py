from django.contrib import admin
from .models import CustomUser, Association, Membre, TypeDocument, Document, Notification


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Profil', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('last_login', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(Association)
class AssociationAdmin(admin.ModelAdmin):
    list_display = ['nom_association', 'statut', 'email_contact', 'created_at']
    list_filter = ['statut', 'created_at']
    search_fields = ['nom_association', 'email_contact']
    fieldsets = (
        (None, {'fields': ('nom_association', 'id_utilisateur')}),
        ('Informations', {'fields': ('ufr', 'statut', 'date_creation_association')}),
        ('Contact', {'fields': ('email_contact', 'tel_contact', 'insta_contact')}),
        ('Dates', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(Membre)
class MembreAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prenom', 'statut_membre', 'id_association', 'date_adhesion']
    list_filter = ['statut_membre', 'date_adhesion', 'id_association']
    search_fields = ['nom', 'prenom', 'email']
    fieldsets = (
        (None, {'fields': ('prenom', 'nom', 'id_association')}),
        ('Contact', {'fields': ('email', 'tel')}),
        ('Adhésion', {'fields': ('date_adhesion', 'date_fin_adhesion', 'statut_membre')}),
        ('Dates', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


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
    fieldsets = (
        (None, {'fields': ('nom_fichier', 'id_association', 'id_type_document')}),
        ('Statut', {'fields': ('statut', 'commentaire_refus')}),
        ('Dates', {'fields': ('date_depot', 'date_expiration')}),
        ('Utilisateur', {'fields': ('uploaded_by',), 'classes': ('collapse',)}),
        ('Métadonnées', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['date_depot', 'created_at', 'updated_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['sujet', 'type', 'id_association', 'date_envoi', 'is_read']
    list_filter = ['type', 'date_envoi', 'is_read']
    search_fields = ['sujet', 'message']
    fieldsets = (
        (None, {'fields': ('sujet', 'message', 'id_association')}),
        ('Type', {'fields': ('type', 'is_read')}),
        ('Dates', {'fields': ('date_envoi', 'created_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['date_envoi', 'created_at']
