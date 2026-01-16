from django.core.management.base import BaseCommand
from api.models import Association, Membre, Mandat, RoleType
from datetime import date


class Command(BaseCommand):
    help = "Initialize members and mandates"

    def handle(self, *args, **options):
        self.stdout.write("Initializing members...")

        # Nettoyage
        Mandat.objects.all().delete()
        Membre.objects.all().delete()

        # -------------------
        # ROLE TYPES
        # -------------------
        role_map = {}
        role_names = [
            "Président", "Vice-président", "Trésorier", "Vice-trésorier",
            "Secrétaire", "Secrétaire adjointe", "Administrateur",
            "Communication", "Responsable image", "Membre",
            "Co-président", "Représentant",
            "Commission pédagogique", "Commission sociale et culturelle",
            "Événementiel"
        ]

        for r in role_names:
            role, _ = RoleType.objects.get_or_create(name=r)
            role_map[r.lower()] = role

        # -------------------
        # DONNÉES MEMBRES
        # -------------------
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

        # -------------------
        # INSERTION
        # -------------------
        for assoc_name, members in DATA.items():
            association = Association.objects.filter(
                nom_association__icontains=assoc_name
            ).first()

            if not association:
                self.stdout.write(self.style.WARNING(f"Association {assoc_name} not found"))
                continue

            for first, last, role_name in members:
                membre = Membre.objects.create(
                    prenom=first,
                    nom=last
                )

                Mandat.objects.create(
                    membre=membre,
                    association=association,
                    role_type=role_map[role_name.lower()],
                    statut="active",
                    date_debut=date.today()
                )

            self.stdout.write(self.style.SUCCESS(f"✓ {assoc_name} members created"))

        self.stdout.write(self.style.SUCCESS("\n✓ Members initialized successfully!"))
