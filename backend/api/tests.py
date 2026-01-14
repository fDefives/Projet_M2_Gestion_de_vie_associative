"""
Tests de l'API - Vérifier le système de rôles et les endpoints
"""

import os
import django
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from api.models import Association, Document, TypeDocument, Membre

User = get_user_model()


class AuthenticationTests(APITestCase):
    """Tests d'authentification"""
    
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='testpass123',
            role='admin'
        )
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            username='user',
            password='testpass123',
            role='user'
        )

    def test_user_registration(self):
        """Test l'enregistrement d'un nouvel utilisateur"""
        response = self.client.post('/api/users/register/', {
            'email': 'newuser@test.com',
            'username': 'newuser',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login(self):
        """Test la connexion"""
        response = self.client.post('/api/auth/login/', {
            'username': 'admin',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_get_current_user(self):
        """Test la récupération du profil utilisateur"""
        # Se connecter
        response = self.client.post('/api/auth/login/', {
            'username': 'user',
            'password': 'testpass123'
        })
        token = response.data['access']
        
        # Récupérer le profil
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'user@test.com')
        self.assertEqual(response.data['role'], 'user')


class RoleBasedAccessTests(APITestCase):
    """Tests du système de rôles"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Créer users admin et regular
        self.admin = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='testpass123',
            role='admin'
        )
        self.user1 = User.objects.create_user(
            email='user1@test.com',
            username='user1',
            password='testpass123',
            role='user'
        )
        self.user2 = User.objects.create_user(
            email='user2@test.com',
            username='user2',
            password='testpass123',
            role='user'
        )
        
        # Créer associations
        self.assoc1 = Association.objects.create(
            nom_association='Association 1',
            id_utilisateur=self.user1
        )
        self.assoc2 = Association.objects.create(
            nom_association='Association 2',
            id_utilisateur=self.user2
        )
        
        # Créer type de document
        self.doc_type = TypeDocument.objects.create(
            libelle='Statuts',
            obligatoire=True
        )
        
        # Créer documents
        self.doc1 = Document.objects.create(
            nom_fichier='doc1.pdf',
            id_association=self.assoc1,
            id_type_document=self.doc_type,
            uploaded_by=self.user1
        )
        self.doc2 = Document.objects.create(
            nom_fichier='doc2.pdf',
            id_association=self.assoc2,
            id_type_document=self.doc_type,
            uploaded_by=self.user2
        )

    def _get_admin_token(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'admin',
            'password': 'testpass123'
        })
        return response.data['access']

    def _get_user_token(self, username):
        response = self.client.post('/api/auth/login/', {
            'username': username,
            'password': 'testpass123'
        })
        return response.data['access']

    def test_admin_sees_all_documents(self):
        """L'admin voit TOUS les documents"""
        token = self._get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Admin voit 2 documents
        document_ids = [doc['id_document'] for doc in response.data]
        self.assertIn(self.doc1.id_document, document_ids)
        self.assertIn(self.doc2.id_document, document_ids)

    def test_user_sees_only_own_documents(self):
        """L'utilisateur voit UNIQUEMENT ses documents"""
        token = self._get_user_token('user1')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # User1 ne voit que son document
        document_ids = [doc['id_document'] for doc in response.data]
        self.assertIn(self.doc1.id_document, document_ids)
        self.assertNotIn(self.doc2.id_document, document_ids)

    def test_user_cannot_delete_other_user_document(self):
        """Un utilisateur ne peut pas supprimer le document d'un autre"""
        token = self._get_user_token('user1')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Essayer de supprimer le document de user2
        response = self.client.delete(f'/api/documents/{self.doc2.id_document}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_can_delete_own_document(self):
        """Un utilisateur peut supprimer son propre document"""
        token = self._get_user_token('user1')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Supprimer son propre document
        response = self.client.delete(f'/api/documents/{self.doc1.id_document}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_admin_can_approve_document(self):
        """L'admin peut approuver un document"""
        token = self._get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.patch(f'/api/documents/{self.doc1.id_document}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['statut'], 'approved')

    def test_user_cannot_approve_document(self):
        """Un utilisateur ne peut pas approuver"""
        token = self._get_user_token('user1')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.patch(f'/api/documents/{self.doc1.id_document}/approve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_cannot_see_other_association(self):
        """Un utilisateur ne voit pas les autres associations"""
        token = self._get_user_token('user1')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/associations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # User1 ne voit que son association
        assoc_ids = [a['id_association'] for a in response.data]
        self.assertIn(self.assoc1.id_association, assoc_ids)
        self.assertNotIn(self.assoc2.id_association, assoc_ids)

    def test_admin_sees_all_associations(self):
        """L'admin voit toutes les associations"""
        token = self._get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/associations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Admin voit les 2 associations
        assoc_ids = [a['id_association'] for a in response.data]
        self.assertIn(self.assoc1.id_association, assoc_ids)
        self.assertIn(self.assoc2.id_association, assoc_ids)


class DocumentManagementTests(APITestCase):
    """Tests de gestion des documents"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='user@test.com',
            username='user',
            password='testpass123',
            role='user'
        )
        self.association = Association.objects.create(
            nom_association='Test Association',
            id_utilisateur=self.user
        )
        self.doc_type = TypeDocument.objects.create(
            libelle='Document Test',
            obligatoire=True
        )

    def _get_token(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'user',
            'password': 'testpass123'
        })
        return response.data['access']

    def test_create_document(self):
        """Test la création d'un document"""
        token = self._get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        with open('test_file.txt', 'w') as f:
            f.write('test content')
        
        with open('test_file.txt', 'rb') as f:
            response = self.client.post('/api/documents/', {
                'nom_fichier': f,
                'id_association': self.association.id_association,
                'id_type_document': self.doc_type.id_type_document
            }, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['statut'], 'submitted')
        
        # Cleanup
        os.remove('test_file.txt')

    def test_filter_by_status(self):
        """Test le filtrage par statut"""
        token = self._get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Créer un document
        Document.objects.create(
            nom_fichier='test.pdf',
            id_association=self.association,
            id_type_document=self.doc_type,
            uploaded_by=self.user,
            statut='submitted'
        )
        
        response = self.client.get('/api/documents/by_status/', {'status': 'submitted'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


if __name__ == '__main__':
    import unittest
    unittest.main()
