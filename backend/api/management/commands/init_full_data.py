from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    Association, AssociationType, TypeDocument,
    Membre, Mandat, RoleType
)
from datetime import date

User = get_user_model()


class Command(BaseCommand):
    help = 'Initialize database with realistic data (associations, members, mandates)'

    def handle(self, *args, **options):
        self.stdout.write('Initializing database...')

        # ------------------------
        # ADMIN
        # ------------------------
        User.objects.filter(email='admin@example.com').delete()

        admin = User.objects.create_superuser(
            username='admin@example.com',
            email='admin@example.com',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )

        self.stdout.write(self.style.SUCCESS('✓ Admin user created'))

        # ------------------------
        # TYPES D’ASSOCIATION
        # ------------------------
        assoc_types = [
            'Écologie', 'Culture', 'Solidarité',
            'Musique', 'International', 'Sport', 'Histoire'
        ]

        for name in assoc_types:
            AssociationType.objects.get_or_create(name=name)

        eco = AssociationType.objects.get(name='Écologie')
        music = AssociationType.objects.get(name='Musique')
        international = AssociationType.objects.get(name='International')
        history = AssociationType.objects.get(name='Histoire')
        solidarity = AssociationType.objects.get(name='Solidarité')

        self.stdout.write(self.style.SUCCESS('✓ Association types created'))

        # ------------------------
        # ASSOCIATIONS
        # ------------------------
        Association.objects.all().delete()

        associations = [
            ("BLAIROUDEURS", "blairoudeurs.larochelle@gmail.com", "Protection de l’environnement.",
             "Maison des Étudiants", eco),
            ("CULTIVE TA TÊTE ET TON ASSIETTE", "ctta.univlr@gmail.com", "Potager universitaire.",
             "IUT La Rochelle", eco),
            ("PRIMROSE", "projet.primrose@gmail.com", "Protections hygiéniques écologiques.",
             "Avenue Michel Crépeau", solidarity),
            ("LES RUCHELAISES", "lesruchelaises.lru@gmail.com", "Apiculture et ateliers.", "La Rochelle", eco),
            ("ENSEMBLE MUSICAL UNIVERSITAIRE", "contact.emulr@gmail.com", "Groupe de musique étudiant.",
             "Maison des Étudiants", music),
            ("ESN LA ROCHELLE", "contact@esnlarochelle.org", "Accueil des étudiants internationaux.",
             "Maison des Étudiants", international),
            ("LEMONSEA", "webmaster.lemonsea@gmail.com", "ONG sur l’acidification des océans.",
             "26 Rue de la Gloire", eco),
            ("UNI'VERT", "univert.lr@gmail.com", "Sensibilisation écologique.",
             "39 Rue François de Vaux", eco),
            ("LEGIO XX VALERIA VICTRIX", "valeriavictrix.legio.xx@gmail.com", "Reconstitution romaine.",
             "La Rochelle", history),
        ]

        for name, email, desc, ufr, atype in associations:
            Association.objects.create(
                nom_association=name,
                email_contact=email,
                desc_association=desc,
                ufr=ufr,
                association_type=atype
            )

        self.stdout.write(self.style.SUCCESS('✓ Associations created'))

        # ------------------------
        # TYPES DE RÔLES
        # ------------------------
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

        self.stdout.write(self.style.SUCCESS('✓ Role types created'))

        # ------------------------
        # MEMBRES + MANDATS
        # ------------------------
        Mandat.objects.all().delete()
        Membre.objects.all().delete()

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
            "LES RUCHELAISES": [
                ("Marcel", "Devynck", "Président"),
            ],
            "ENSEMBLE MUSICAL UNIVERSITAIRE": [
                ("Baptiste", "Belisaire", "Président"),
            ],
            "ESN LA ROCHELLE": [
                ("Ange", "Magnard", "Président"),
                ("Charline", "Nobili", "Trésorier"),
                ("Tania", "Mihala", "Vice-président"),
                ("Eva", "Laffargue", "Secrétaire"),
            ],
            "GEOCEAN": [
                ("Aurore", "Marcq", "Président"),
                ("Elliott", "Brandel", "Secrétaire"),
                ("Tom", "Degeorges", "Trésorier"),
                ("Amandine", "Monteil", "Communication"),
                ("Clélhia", "Langlais", "Responsable image"),
                ("Florian", "Vancorselis", "Membre"),
            ],
            "LEMONSEA": [
                ("Louxandra", "Combes", "Président"),
                ("Jeanne", "Dumas", "Vice-président"),
                ("Evie", "Bagard", "Secrétaire"),
                ("Elfi", "Duivon", "Trésorier"),
            ],
            "UNI'VERT": [
                ("Lucas", "Pibouleau", "Président"),
                ("Romain", "Witz", "Vice-président"),
                ("Pauline", "Cheval", "Secrétaire"),
                ("Hugo", "Pierre", "Trésorier"),
                ("Jules", "Cressiot", "Vice-trésorier"),
            ],
            "LEGIO XX VALERIA VICTRIX": [
                ("Antonin", "Pacquet", "Co-président"),
                ("Emile", "Thelliere", "Co-président"),
            ],
        }

        for assoc_name, members in DATA.items():
            association = Association.objects.filter(
                nom_association__icontains=assoc_name
            ).first()

            if not association:
                continue

            for first, last, role in members:
                membre = Membre.objects.create(prenom=first, nom=last)

                Mandat.objects.create(
                    membre=membre,
                    association=association,
                    role_type=role_map[role.lower()],
                    statut="active",
                    date_debut=date.today()
                )

        self.stdout.write(self.style.SUCCESS('✓ Members & mandates created'))

        # ------------------------
        # TYPES DE DOCUMENTS
        # ------------------------
        doc_types = [
            {'libelle': 'Statuts', 'obligatoire': True},
            {'libelle': 'Assurance', 'obligatoire': True, 'duree_validite_mois': 12},
            {'libelle': 'Budget', 'obligatoire': False},
            {'libelle': 'Rapport', 'obligatoire': False},
        ]

        for doc in doc_types:
            TypeDocument.objects.get_or_create(**doc)

        self.stdout.write(self.style.SUCCESS('✓ Document types created'))

        self.stdout.write(self.style.SUCCESS('\n✓ Database fully initialized!'))
