from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.db import models


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class RoleType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class AssociationType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Association(models.Model):
    """Modèle association"""

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("suspended", "Suspendue"),
    ]

    id_association = models.AutoField(primary_key=True)
    nom_association = models.CharField(max_length=255)
    date_creation_association = models.DateField(auto_now_add=True)
    num_siret = models.CharField(max_length=14, blank=True)
    desc_association = models.TextField(blank=True, null=True)
    ufr = models.CharField(max_length=100, blank=True)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    email_contact = models.EmailField(blank=True, null=True)
    insta_contact = models.CharField(max_length=255, blank=True)
    tel_contact = models.CharField(max_length=20, blank=True)
    id_utilisateur = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    association_type = models.ForeignKey(
        AssociationType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="associations",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.nom_association


class Membre(models.Model):
    STATUS_CHOICES = [
        ("active", "Actif"),
        ("inactive", "Inactif"),
        ("pending", "En attente"),
    ]

    id_membre = models.AutoField(primary_key=True)
    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)

    # ✅ Date d'anniversaire
    date_of_birth = models.DateField(
        verbose_name="Date de naissance", blank=True, null=True
    )

    date_adhesion = models.DateField(auto_now_add=True)
    statut_membre = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="pending"
    )
    date_fin_adhesion = models.DateField(blank=True, null=True)

    associations = models.ManyToManyField(
        Association, through="Mandat", related_name="membres_via_mandat"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class TypeDocument(models.Model):
    """Modèle type de document"""

    id_type_document = models.AutoField(primary_key=True)
    libelle = models.CharField(max_length=100, unique=True)
    obligatoire = models.BooleanField(default=False)
    duree_validite_mois = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expire_si_changement_president = models.BooleanField(
        default=False,
        help_text="Si vrai, le document expire automatiquement lors "
                  "du changement de président"
    )

    class Meta:
        ordering = ["libelle"]

    def __str__(self):
        return self.libelle


class Document(models.Model):
    """Modèle document"""

    STATUS_CHOICES = [
        ("draft", "Brouillon"),
        ("submitted", "Soumis"),
        ("approved", "Approuvé"),
        ("rejected", "Rejeté"),
        ("expired", "Expiré"),
    ]

    id_document = models.AutoField(primary_key=True)
    nom_fichier = models.FileField(
        upload_to="documents/%Y/%m/%d/",
        validators=[
            FileExtensionValidator(
                allowed_extensions=[
                    "pdf",
                    "doc",
                    "docx",
                    "xls",
                    "xlsx",
                    "jpg",
                    "jpeg",
                    "png",
                ]
            )
        ],
    )
    date_depot = models.DateTimeField(auto_now_add=True)
    date_expiration = models.DateField(blank=True, null=True)
    statut = models.CharField(
        max_length=30, choices=STATUS_CHOICES, default="submitted"
    )
    commentaire_refus = models.TextField(blank=True)
    id_association = models.ForeignKey(
        Association, on_delete=models.CASCADE, related_name="documents"
    )
    id_type_document = models.ForeignKey(
        TypeDocument, on_delete=models.SET_NULL, null=True
    )
    uploaded_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name="documents_uploaded",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_depot"]

    def __str__(self):
        return f"{self.nom_fichier} - {self.id_association}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ("info", "Information"),
        ("warning", "Avertissement"),
        ("error", "Erreur"),
        ("success", "Succès"),
    ]

    id_notification = models.AutoField(primary_key=True)
    date_envoi = models.DateTimeField(auto_now_add=True)
    sujet = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="info")
    id_association = models.ForeignKey(
        Association, on_delete=models.CASCADE, related_name="notifications"
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_envoi"]

    def __str__(self):
        return f"{self.sujet} - {self.id_association}"


class Mandat(models.Model):
    STATUS_CHOICES = [
        ("active", "Actif"),
        ("termine", "Terminé"),
        ("suspendu", "Suspendu"),
    ]

    id_mandat = models.AutoField(primary_key=True)
    membre = models.ForeignKey(Membre, on_delete=models.CASCADE, related_name="mandats")
    association = models.ForeignKey(
        Association, on_delete=models.CASCADE, related_name="mandats"
    )

    role_type = models.ForeignKey(
        RoleType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="mandats",
    )

    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    date_debut = models.DateField()
    date_fin = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_debut"]

    def __str__(self):
        return f"{self.membre} - {self.role_type} ({self.association})"
