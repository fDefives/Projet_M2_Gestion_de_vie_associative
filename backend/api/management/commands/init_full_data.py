from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    Association, AssociationType, TypeDocument,
    Membre, Mandat, RoleType
)
from datetime import date
import os

User = get_user_model()


class Command(BaseCommand):
    help = "Seed full realistic data (safe, idempotent unless RESET_FULL_DATA=true)"

    def handle(self, *args, **options):

        # ======================================================
        # GARDE-FOU
        # ======================================================
        if Association.objects.exists() and os.getenv("RESET_FULL_DATA") != "true":
            self.stdout.write(
                self.style.WARNING(
                    "Full data already initialized. Skipping init_full_data."
                )
            )
            return

        if os.getenv("RESET_FULL_DATA") == "true":
            self.stdout.write(self.style.WARNING("⚠️ RESET_FULL_DATA enabled"))

            Mandat.objects.all().delete()
            Membre.objects.all().delete()
            Association.objects.all().delete()
            AssociationType.objects.all().delete()
            RoleType.objects.all().delete()
            TypeDocument.objects.all().delete()

            User.objects.filter(email="admin@example.com").delete()

        self.stdout.write("Initializing full dataset...")

        # ======================================================
        # ADMIN
        # ======================================================
        admin, created = User.objects.get_or_create(
            email="admin@example.com",
            defaults={
                "username": "admin@example.com",
                "is_staff": True,
                "is_superuser": True,
                "role": "admin",
            },
        )

        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("✓ Admin user created"))

        # ======================================================
        # TYPES D’ASSOCIATION
        # ======================================================
        assoc_types = [
            "Écologie", "Culture", "Solidarité",
            "Musique", "International", "Sport", "Histoire"
        ]

        assoc_type_map = {}
        for name in assoc_types:
            at, _ = AssociationType.objects.get_or_create(name=name)
            assoc_type_map[name] = at

        self.stdout.write(self.style.SUCCESS("✓ Association types created"))

        # ======================================================
        # ASSOCIATIONS
        # ======================================================
        associations = [
            ("BLAIROUDEURS", "blairoudeurs.larochelle@gmail.com",
             "Protection de l’environnement.", "Maison des Étudiants", "Écologie"),
            ("CULTIVE TA TÊTE ET TON ASSIETTE", "ctta.univlr@gmail.com",
             "Potager universitaire.", "IUT La Rochelle", "Écologie"),
            ("PRIMROSE", "projet.primrose@gmail.com",
             "Protections hygiéniques écologiques.", "Avenue Michel Crépeau", "Solidarité"),
            ("LES RUCHELAISES", "lesruchelaises.lru@gmail.com",
             "Apiculture et ateliers.", "La Rochelle", "Écologie"),
            ("ENSEMBLE MUSICAL UNIVERSITAIRE", "contact.emulr@gmail.com",
             "Groupe de musique étudiant.", "Maison des Étudiants", "Musique"),
            ("ESN LA ROCHELLE", "contact@esnlarochelle.org",
             "Accueil des étudiants internationaux.", "Maison des Étudiants", "International"),
            ("LEMONSEA", "webmaster.lemonsea@gmail.com",
             "ONG sur l’acidification des océans.", "26 Rue de la Gloire", "Écologie"),
            ("UNI'VERT", "univert.lr@gmail.com",
             "Sensibilisation écologique.", "39 Rue François de Vaux", "Écologie"),
            ("LEGIO XX VALERIA VICTRIX", "valeriavictrix.legio.xx@gmail.com",
             "Reconstitution romaine.", "La Rochelle", "Histoire"),
        ]

        assoc_map = {}
        for name, email, desc, ufr, type_name in associations:
            assoc, _ = Association.objects.get_or_create(
                nom_association=name,
                defaults={
                    "email_contact": email,
                    "desc_association": desc,
                    "ufr": ufr,
                    "association_type": assoc_type_map[type_name],
                },
            )
            assoc_map[name] = assoc

        self.stdout.write(self.style.SUCCESS("✓ Associations created"))

        # ======================================================
        # TYPES DE RÔLES
        # ======================================================
        role_names = [
            "Président", "Vice-président", "Trésorier",
            "Vice-trésorier", "Secrétaire", "Administrateur",
            "Communication", "Responsable image", "Membre",
            "Co-président"
        ]

        role_map = {}
        for r in role_names:
            role, _ = RoleType.objects.get_or_create(name=r)
            role_map[r.lower()] = role

        self.stdout.write(self.style.SUCCESS("✓ Role types created"))

        # ======================================================
        # MEMBRES + MANDATS
        # ======================================================
        DATA = {
            "BLAIROUDEURS": [
                ("Audrey", "Dubois", "Président"),
                ("Mathieu", "Cazin", "Trésorier"),
                ("Line", "Rolland Guillard", "Secrétaire"),
                ("Paul", "Cacot", "Administrateur"),
            ],
            "PRIMROSE": [
                ("Julia", "Mourgues", "Président"),
                ("Justine", "Galaup", "Vice-président"),
                ("Callixte", "Montezin", "Secrétaire"),
                ("François", "Defive", "Trésorier"),
            ],
        }

        for assoc_name, members in DATA.items():
            association = assoc_map.get(assoc_name)
            if not association:
                continue

            for first, last, role in members:
                membre, _ = Membre.objects.get_or_create(
                    prenom=first,
                    nom=last,
                )

                Mandat.objects.get_or_create(
                    membre=membre,
                    association=association,
                    role_type=role_map[role.lower()],
                    defaults={
                        "statut": "active",
                        "date_debut": date.today(),
                    },
                )

        self.stdout.write(self.style.SUCCESS("✓ Members & mandates created"))

        # ======================================================
        # TYPES DE DOCUMENTS
        # ======================================================
        doc_types = [
            {"libelle": "Statuts", "obligatoire": True},
            {"libelle": "Assurance", "obligatoire": True, "duree_validite_mois": 12},
            {"libelle": "Budget", "obligatoire": False},
            {"libelle": "Rapport", "obligatoire": False},
        ]

        for doc in doc_types:
            TypeDocument.objects.get_or_create(**doc)

        self.stdout.write(self.style.SUCCESS("✓ Document types created"))

        self.stdout.write(
            self.style.SUCCESS("\n✓ Full dataset initialized successfully!")
        )
