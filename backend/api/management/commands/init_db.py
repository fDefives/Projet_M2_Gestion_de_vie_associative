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

        # Créer un utilisateur admin (username = email pour cohérence avec la doc)
        if not User.objects.filter(email='admin@example.com').exists():
            admin = User.objects.create_superuser(
                username='admin@example.com',
                email='admin@example.com',
                password='admin123',
                role='admin'
            )
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
