from rest_framework import serializers
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field
from typing import Optional

from .models import (
    Association,
    AssociationType,
    Membre,
    TypeDocument,
    Document,
    Notification,
    Mandat,
    RoleType,
)

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""

    id_association = serializers.SerializerMethodField()
    association_nom = serializers.SerializerMethodField()
    role_type_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_staff",
            "first_name",
            "last_name",
            "is_active",
            "id_association",
            "association_nom",
            "role_type_name",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "id_association",
            "association_nom",
            "role_type_name",
        ]

    @extend_schema_field(serializers.IntegerField(allow_null=True))
    def get_id_association(self, obj) -> Optional[int]:
        """Retourne l'ID de l'association si l'utilisateur en gère une"""
        try:
            from .models import Association

            assoc = Association.objects.get(id_utilisateur=obj)
            return assoc.id_association
        except Association.DoesNotExist:
            return None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_association_nom(self, obj) -> Optional[str]:
        """Retourne le nom de l'association si l'utilisateur en gère une"""
        try:
            from .models import Association

            assoc = Association.objects.get(id_utilisateur=obj)
            return assoc.nom_association
        except Association.DoesNotExist:
            return None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_role_type_name(self, obj) -> Optional[str]:
        """Retourne le rôle si l'utilisateur en a un via un mandat"""
        try:
            from .models import Membre, Mandat

            # Chercher un membre associé à cet utilisateur
            membre = Membre.objects.filter(
                mandats__association__id_utilisateur=obj
            ).first()

            if membre:
                mandat = Mandat.objects.filter(
                    membre=membre, association__id_utilisateur=obj
                ).first()
                if mandat and mandat.role_type:
                    return mandat.role_type.name
        except Exception:
            pass
        return None


class CustomUserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'utilisateurs"""

    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    id_association = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "password",
            "password2",
            "first_name",
            "last_name",
            "id_association",
        ]

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError(
                {"password": "Les mots de passe ne correspondent pas."}
            )
        return data

    def create(self, validated_data):
        from .models import Association

        validated_data.pop("password2")
        password = validated_data.pop("password")
        id_association = validated_data.pop("id_association", None)

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Associer l'utilisateur à l'association s'il y en a une
        if id_association:
            try:
                association = Association.objects.get(id_association=id_association)
                association.id_utilisateur = user
                association.save()
            except Association.DoesNotExist:
                raise serializers.ValidationError(
                    {"id_association": "L'association avec cet ID n'existe pas."}
                )

        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour le changement de mot de passe"""

    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    new_password2 = serializers.CharField(write_only=True, required=True)

    def validate_old_password(self, value):
        """Vérifie que l'ancien mot de passe est correct"""
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
        return value

    def validate(self, data):
        """Vérifie que les nouveaux mots de passe correspondent"""
        if data["new_password"] != data["new_password2"]:
            raise serializers.ValidationError(
                {"new_password": "Les nouveaux mots de passe ne correspondent pas."}
            )

        # Optionnel : vérifier que le nouveau mot de passe est différent de l'ancien
        if data["old_password"] == data["new_password"]:
            raise serializers.ValidationError(
                {
                    "new_password": "Le nouveau mot de passe doit "
                    "être différent de l'ancien."
                }
            )

        return data

    def save(self, **kwargs):
        """Change le mot de passe de l'utilisateur"""
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer pour la demande de réinitialisation de mot de passe"""

    email = serializers.EmailField(
        required=True, help_text="L'email du compte à réinitialiser"
    )


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer pour la confirmation de réinitialisation de mot de passe"""

    uidb64 = serializers.CharField(
        required=True, help_text="L'identifiant encodé de l'utilisateur"
    )
    token = serializers.CharField(
        required=True, help_text="Le token de réinitialisation"
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        help_text="Le nouveau mot de passe (min 8 caractères)",
    )
    new_password2 = serializers.CharField(
        write_only=True, required=True, help_text="Confirmation du nouveau mot de passe"
    )

    def validate(self, data):
        """Vérifie que les nouveaux mots de passe correspondent"""
        if data["new_password"] != data["new_password2"]:
            raise serializers.ValidationError(
                {"new_password": "Les mots de passe ne correspondent pas."}
            )
        return data


class AssociationTypeSerializer(serializers.ModelSerializer):
    """Serializer pour les types d'associations"""

    class Meta:
        model = AssociationType
        fields = ["id", "name", "description", "created_at"]
        read_only_fields = ["id", "created_at"]


class AssociationSerializer(serializers.ModelSerializer):
    """Serializer pour les associations"""

    user_email = serializers.CharField(source="id_utilisateur.email", read_only=True)
    association_type_name = serializers.CharField(
        source="association_type.name", read_only=True
    )

    class Meta:
        model = Association
        fields = [
            "id_association",
            "nom_association",
            "date_creation_association",
            "ufr",
            "statut",
            "email_contact",
            "insta_contact",
            "tel_contact",
            "num_siret",
            "desc_association",
            "association_type",
            "association_type_name",
            "id_utilisateur",
            "user_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id_association", "created_at", "updated_at"]


class MembreSerializer(serializers.ModelSerializer):
    """Serializer pour les membres - indépendants des associations"""

    class Meta:
        model = Membre
        fields = [
            "id_membre",
            "prenom",
            "nom",
            "date_of_birth",
            "date_adhesion",
            "statut_membre",
            "date_fin_adhesion",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id_membre", "date_adhesion", "created_at", "updated_at"]


class TypeDocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les types de documents"""

    class Meta:
        model = TypeDocument
        fields = [
            "id_type_document",
            "libelle",
            "obligatoire",
            "duree_validite_mois",
            "created_at",
        ]
        read_only_fields = ["id_type_document", "created_at"]


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les documents"""

    uploaded_by_email = serializers.CharField(
        source="uploaded_by.email", read_only=True
    )
    type_document_name = serializers.CharField(
        source="id_type_document.libelle", read_only=True
    )

    class Meta:
        model = Document
        fields = [
            "id_document",
            "nom_fichier",
            "date_depot",
            "date_expiration",
            "statut",
            "commentaire_refus",
            "id_association",
            "id_type_document",
            "type_document_name",
            "uploaded_by",
            "uploaded_by_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id_document",
            "date_depot",
            "uploaded_by",
            "created_at",
            "updated_at",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""

    class Meta:
        model = Notification
        fields = [
            "id_notification",
            "date_envoi",
            "sujet",
            "message",
            "type",
            "id_association",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id_notification", "date_envoi", "created_at"]


class RoleTypeSerializer(serializers.ModelSerializer):
    """Serializer pour les types de rôles"""

    id = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    description = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    class Meta:
        model = RoleType
        fields = ["id", "name", "description", "created_at"]
        read_only_fields = ["id", "created_at"]


class UpdateProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name"]

    def validate_username(self, value):
        user = self.context["request"].user
        if (
            User.objects.filter(username=value)
            .exclude(id=user.id)
            .exists()
        ):
            raise serializers.ValidationError(
                "Ce nom d'utilisateur est déjà utilisé."
            )
        return value

    def validate_email(self, value):
        user = self.context["request"].user
        if (
            User.objects.filter(email=value)
            .exclude(id=user.id)
            .exists()
        ):
            raise serializers.ValidationError(
                "Cette adresse email est déjà utilisée."
            )
        return value


class MandatSerializer(serializers.ModelSerializer):
    """Serializer pour les mandats"""

    membre_nom = serializers.CharField(source="membre.__str__", read_only=True)
    association_nom = serializers.CharField(
        source="association.nom_association", read_only=True
    )
    role_type_name = serializers.CharField(source="role_type.name", read_only=True)

    class Meta:
        model = Mandat
        fields = [
            "id_mandat",
            "membre",
            "membre_nom",
            "association",
            "association_nom",
            "role_type",
            "role_type_name",
            "statut",
            "date_debut",
            "date_fin",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id_mandat", "created_at", "updated_at"]
