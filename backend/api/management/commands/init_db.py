"""
Management command to initialize the database with test users and associations
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Association, TypeDocument

User = get_user_model()


class Command(BaseCommand):
    help = 'Initialize database with test data'

    def handle(self, *args, **options):
        self.stdout.write('Initializing database...')

        # Supprimer les anciennes données de test si l'admin existe
        admin_existing = User.objects.filter(email='admin@example.com').first()
        if admin_existing:
            # Supprimer les associations liées
            Association.objects.filter(id_utilisateur=admin_existing).delete()
            # Supprimer l'admin
            admin_existing.delete()

        # Créer un utilisateur admin (username = email pour cohérence avec la doc)
        admin = User.objects.create_superuser(
            username='admin@example.com',
            email='admin@example.com',
            password='admin123'
        )
        admin.role = 'admin'
        admin.is_staff = True
        admin.save()
        self.stdout.write(self.style.SUCCESS('✓ Admin user created'))

        # Créer des utilisateurs test
        test_users = [
            {'email': 'user1@example.com', 'username': 'user1', 'password': 'pass123'},
            {'email': 'user2@example.com', 'username': 'user2', 'password': 'pass123'},
        ]

        for user_data in test_users:
            if not User.objects.filter(email=user_data['email']).exists():
                user = User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    password=user_data['password'],
                    role='user'
                )
                self.stdout.write(self.style.SUCCESS(f'✓ User {user_data["email"]} created'))

        # Créer des associations de test
        admin_user = User.objects.get(email='admin@example.com')
        
        if not Association.objects.filter(nom_association='Association Test 1').exists():
            Association.objects.create(
                nom_association='Association Test 1',
                ufr='UFR Sciences',
                statut='active',
                email_contact='test1@association.fr',
                tel_contact='01234567890',
                id_utilisateur=admin_user
            )
            self.stdout.write(self.style.SUCCESS('✓ Association 1 created'))

        # Créer des associations pour les utilisateurs test
        user1 = User.objects.get(email='user1@example.com')
        if not Association.objects.filter(nom_association='Association Étudiante User1').exists():
            Association.objects.create(
                nom_association='Association Étudiante User1',
                ufr='UFR Lettres et Langues',
                statut='active',
                email_contact='user1@association.fr',
                tel_contact='01111111111',
                id_utilisateur=user1
            )
            self.stdout.write(self.style.SUCCESS('✓ Association User1 created'))

        user2 = User.objects.get(email='user2@example.com')
        if not Association.objects.filter(nom_association='Association Étudiante User2').exists():
            Association.objects.create(
                nom_association='Association Étudiante User2',
                ufr='UFR Droit et Économie',
                statut='active',
                email_contact='user2@association.fr',
                tel_contact='02222222222',
                id_utilisateur=user2
            )
            self.stdout.write(self.style.SUCCESS('✓ Association User2 created'))

        # Créer des types de documents
        doc_types = [
            {'libelle': 'Statuts', 'obligatoire': True, 'duree_validite_mois': None},
            {'libelle': 'Assurance', 'obligatoire': True, 'duree_validite_mois': 12},
            {'libelle': 'Budget', 'obligatoire': False, 'duree_validite_mois': 12},
            {'libelle': 'Rapport', 'obligatoire': False, 'duree_validite_mois': None},
        ]

        for doc_type in doc_types:
            if not TypeDocument.objects.filter(libelle=doc_type['libelle']).exists():
                TypeDocument.objects.create(**doc_type)
                self.stdout.write(self.style.SUCCESS(f'✓ Document type {doc_type["libelle"]} created'))

        self.stdout.write(self.style.SUCCESS('\n✓ Database initialized successfully!'))
