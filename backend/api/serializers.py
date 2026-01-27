from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Association, AssociationType, Membre, TypeDocument, Document, Notification, Mandat, RoleType

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'first_name', 'last_name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class CustomUserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'utilisateurs"""
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AssociationTypeSerializer(serializers.ModelSerializer):
    """Serializer pour les types d'associations"""
    class Meta:
        model = AssociationType
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class AssociationSerializer(serializers.ModelSerializer):
    """Serializer pour les associations"""
    user_email = serializers.CharField(source='id_utilisateur.email', read_only=True)
    association_type_name = serializers.CharField(source='association_type.name', read_only=True)

    class Meta:
        model = Association
        fields = ['id_association', 'nom_association', 'date_creation_association', 'ufr',
                  'statut', 'email_contact', 'insta_contact', 'tel_contact', 'num_siret',
                  'desc_association', 'association_type', 'association_type_name', 'id_utilisateur',
                  'user_email', 'created_at', 'updated_at']
        read_only_fields = ['id_association', 'created_at', 'updated_at']


class MembreSerializer(serializers.ModelSerializer):
    associations = serializers.StringRelatedField(
        many=True,
        source='associations'
    )

    class Meta:
        model = Membre
        fields = [
            'id_membre', 'prenom', 'nom', 'email', 'tel',
            'date_adhesion', 'statut_membre', 'date_fin_adhesion',
            'associations', 'created_at', 'updated_at'
        ]


class TypeDocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les types de documents"""
    class Meta:
        model = TypeDocument
        fields = ['id_type_document', 'libelle', 'obligatoire', 'duree_validite_mois', 'created_at']
        read_only_fields = ['id_type_document', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les documents"""
    uploaded_by_email = serializers.CharField(source='uploaded_by.email', read_only=True)
    type_document_name = serializers.CharField(source='id_type_document.libelle', read_only=True)

    class Meta:
        model = Document
        fields = ['id_document', 'nom_fichier', 'date_depot', 'date_expiration', 'statut',
                  'commentaire_refus', 'id_association', 'id_type_document', 'type_document_name',
                  'uploaded_by', 'uploaded_by_email', 'created_at', 'updated_at']
        read_only_fields = ['id_document', 'date_depot', 'uploaded_by', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    class Meta:
        model = Notification
        fields = ['id_notification', 'date_envoi', 'sujet', 'message', 'type',
                  'id_association', 'is_read', 'created_at']
        read_only_fields = ['id_notification', 'date_envoi', 'created_at']


class RoleTypeSerializer(serializers.ModelSerializer):
    """Serializer pour les types de rôles"""
    class Meta:
        model = RoleType
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class MandatSerializer(serializers.ModelSerializer):
    """Serializer pour les mandats"""
    membre_nom = serializers.CharField(source='membre.__str__', read_only=True)
    association_nom = serializers.CharField(source='association.nom_association', read_only=True)
    role_type_name = serializers.CharField(source='role_type.name', read_only=True)

    class Meta:
        model = Mandat
        fields = ['id_mandat', 'membre', 'membre_nom', 'association', 'association_nom',
                  'role_type', 'role_type_name', 'statut', 'date_debut', 'date_fin',
                  'created_at', 'updated_at']
        read_only_fields = ['id_mandat', 'created_at', 'updated_at']
