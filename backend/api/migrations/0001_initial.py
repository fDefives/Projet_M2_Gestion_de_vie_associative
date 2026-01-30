# Generated migration for api app

import django.core.validators
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="CustomUser",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this "
                        "user has all "
                        "permissions without "
                        "explicitly assigning "
                        "them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={
                            "unique": "A user with that username already exists."
                        },
                        help_text="Required. 150 characters or "
                        "fewer. Letters, digits and "
                        "@/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        verbose_name="username",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="first name"
                    ),
                ),
                (
                    "last_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="last name"
                    ),
                ),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the "
                        "user can log into this "
                        "admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Designates whether this "
                        "user account should be "
                        "considered active. "
                        "Uncheck this instead of "
                        "deleting accounts.",
                        verbose_name="active",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(auto_now_add=True, verbose_name="date joined"),
                ),
                ("email", models.EmailField(max_length=255, unique=True)),
                (
                    "role",
                    models.CharField(
                        choices=[("admin", "Administrateur"), ("user", "Utilisateur")],
                        default="user",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user "
                        "belongs to. A user will "
                        "get all permissions "
                        "granted to each of their "
                        "groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific " "permissions " "for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user " "permissions",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Association",
            fields=[
                ("id_association", models.AutoField(primary_key=True, serialize=False)),
                ("nom_association", models.CharField(max_length=255)),
                ("date_creation_association", models.DateField(auto_now_add=True)),
                ("ufr", models.CharField(blank=True, max_length=100, null=True)),
                (
                    "statut",
                    models.CharField(
                        choices=[
                            ("active", "Active"),
                            ("inactive", "Inactive"),
                            ("suspended", "Suspendue"),
                        ],
                        default="active",
                        max_length=20,
                    ),
                ),
                (
                    "email_contact",
                    models.EmailField(blank=True, max_length=255, null=True),
                ),
                (
                    "insta_contact",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
                ("tel_contact", models.CharField(blank=True, max_length=20, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "id_utilisateur",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="TypeDocument",
            fields=[
                (
                    "id_type_document",
                    models.AutoField(primary_key=True, serialize=False),
                ),
                ("libelle", models.CharField(max_length=100, unique=True)),
                ("obligatoire", models.BooleanField(default=False)),
                ("duree_validite_mois", models.IntegerField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["libelle"],
            },
        ),
        migrations.CreateModel(
            name="Notification",
            fields=[
                (
                    "id_notification",
                    models.AutoField(primary_key=True, serialize=False),
                ),
                ("date_envoi", models.DateTimeField(auto_now_add=True)),
                ("sujet", models.CharField(max_length=255)),
                ("message", models.TextField()),
                (
                    "type",
                    models.CharField(
                        choices=[
                            ("info", "Information"),
                            ("warning", "Avertissement"),
                            ("error", "Erreur"),
                            ("success", "Succès"),
                        ],
                        default="info",
                        max_length=20,
                    ),
                ),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "id_association",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="notifications",
                        to="api.association",
                    ),
                ),
            ],
            options={
                "ordering": ["-date_envoi"],
            },
        ),
        migrations.CreateModel(
            name="Membre",
            fields=[
                ("id_membre", models.AutoField(primary_key=True, serialize=False)),
                ("prenom", models.CharField(max_length=100)),
                ("nom", models.CharField(max_length=100)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                ("tel", models.CharField(blank=True, max_length=20, null=True)),
                ("date_adhesion", models.DateField(auto_now_add=True)),
                (
                    "statut_membre",
                    models.CharField(
                        choices=[
                            ("active", "Actif"),
                            ("inactive", "Inactif"),
                            ("pending", "En attente"),
                        ],
                        default="pending",
                        max_length=50,
                    ),
                ),
                ("date_fin_adhesion", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "id_association",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="membres",
                        to="api.association",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Document",
            fields=[
                ("id_document", models.AutoField(primary_key=True, serialize=False)),
                (
                    "nom_fichier",
                    models.FileField(
                        upload_to="documents/%Y/%m/%d/",
                        validators=[
                            django.core.validators.FileExtensionValidator(
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
                    ),
                ),
                ("date_depot", models.DateTimeField(auto_now_add=True)),
                ("date_expiration", models.DateField(blank=True, null=True)),
                (
                    "statut",
                    models.CharField(
                        choices=[
                            ("draft", "Brouillon"),
                            ("submitted", "Soumis"),
                            ("approved", "Approuvé"),
                            ("rejected", "Rejeté"),
                            ("expired", "Expiré"),
                        ],
                        default="submitted",
                        max_length=30,
                    ),
                ),
                ("commentaire_refus", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "id_association",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="documents",
                        to="api.association",
                    ),
                ),
                (
                    "id_type_document",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="api.typedocument",
                    ),
                ),
                (
                    "uploaded_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="documents_uploaded",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-date_depot"],
            },
        ),
    ]
