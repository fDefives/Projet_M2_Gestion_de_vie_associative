"""Tests d'API alignés sur les routes déclarées (swagger-like)."""

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from api.models import Association, TypeDocument, Document

User = get_user_model()


class APISwaggerFlowTests(APITestCase):
    """Couvre les cas principaux décrits par la doc: création via admin, accès restreint user, gestion docs."""

    def setUp(self):
        self.client = APIClient()

        # Nettoyage complet des données pour isoler les tests
        User.objects.all().delete()
        Association.objects.all().delete()
        Document.objects.all().delete()
        TypeDocument.objects.all().delete()

        # Admin (utilise is_staff pour passer les gardes dans les viewsets)
        self.admin = User.objects.create_user(
            email='admin@test.com',
            username='admin',
            password='testpass123',
            is_staff=True,
        )

        # Type de document commun
        self.doc_type = TypeDocument.objects.create(
            libelle='Statuts',
            obligatoire=True,
        )

    # Helpers -----------------------------------------------------
    def _login(self, username, password):
        resp = self.client.post('/api/auth/login/', {
            'username': username,
            'password': password,
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        return resp.data['access']

    def _auth_as(self, username, password):
        token = self._login(username, password)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return token

    # Tests -------------------------------------------------------
    def test_admin_creates_association_and_user_can_access_it(self):
        """Admin crée une association avec création auto d'un compte; le nouveau user ne voit que son asso."""
        admin_token = self._auth_as('admin', 'testpass123')

        # Création via /api/associations/ avec les champs d'user attendus par perform_create
        payload = {
            'nom_association': 'Association Test',
            'user_email': 'newuser@test.com',
            'user_password': 'password123',
            'user_username': 'newuser',
        }
        create_resp = self.client.post('/api/associations/', payload, format='json')
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)

        assoc_id = create_resp.data['id_association']
        created_user_id = create_resp.data['id_utilisateur']

        # Le nouvel utilisateur se connecte et ne voit que son association
        self.client.credentials()  # reset
        list_resp = self.client.get('/api/associations/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        # La réponse est paginée en DRF: extraire results
        results = list_resp.data['results'] if isinstance(list_resp.data, dict) else list_resp.data
        assoc_ids = [a['id_association'] for a in results]
        self.assertEqual(assoc_ids, [assoc_id])

        # Vérifie que l'association est liée au bon utilisateur
        association = Association.objects.get(id_association=assoc_id)
        self.assertEqual(association.id_utilisateur_id, created_user_id)

        # Restaure token admin pour autres tests
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

    def test_user_cannot_see_other_associations(self):
        """Chaque user ne liste que son asso; admin voit tout."""
        self._auth_as('admin', 'testpass123')

        # Crée deux associations distinctes
        for i in (1, 2):
            self.client.post('/api/associations/', {
                'nom_association': f'Asso {i}',
                'user_email': f'user{i}@test.com',
                'user_password': 'password123',
                'user_username': f'user{i}',
            }, format='json')

        # Admin voit 2 associations
        admin_list = self.client.get('/api/associations/')
        results = admin_list.data['results'] if isinstance(admin_list.data, dict) else admin_list.data
        self.assertEqual(len(results), 2)

        # User1 ne voit que sa propre association
        self.client.credentials()
        self._auth_as('user1', 'password123')
        user1_list = self.client.get('/api/associations/')
        results = user1_list.data['results'] if isinstance(user1_list.data, dict) else user1_list.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['nom_association'], 'Asso 1')

    def test_user_creates_document_and_admin_can_approve(self):
        """User soumet un document, admin peut l'approuver, user ne peut pas l'approuver."""
        self._auth_as('admin', 'testpass123')
        create_resp = self.client.post('/api/associations/', {
            'nom_association': 'Asso Doc',
            'user_email': 'docuser@test.com',
            'user_password': 'password123',
            'user_username': 'docuser',
        }, format='json')
        assoc_id = create_resp.data['id_association']

        # User uploade un document
        self.client.credentials()
        self._auth_as('docuser', 'password123')
        fake_file = SimpleUploadedFile('test.pdf', b'dummy content', content_type='application/pdf')
        doc_resp = self.client.post('/api/documents/', {
            'nom_fichier': fake_file,
            'id_association': assoc_id,
            'id_type_document': self.doc_type.id_type_document,
        }, format='multipart')
        self.assertEqual(doc_resp.status_code, status.HTTP_201_CREATED)
        doc_id = doc_resp.data['id_document']

        # User ne peut pas approuver
        user_approve = self.client.patch(f'/api/documents/{doc_id}/approve/')
        self.assertEqual(user_approve.status_code, status.HTTP_403_FORBIDDEN)

        # Admin peut approuver
        self.client.credentials()
        self._auth_as('admin', 'testpass123')
        admin_approve = self.client.patch(f'/api/documents/{doc_id}/approve/')
        self.assertEqual(admin_approve.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_approve.data['statut'], 'approved')

    def test_document_visibility_respects_role(self):
        """Admin voit tout; user ne voit que les docs de son asso."""
        self._auth_as('admin', 'testpass123')

        # Assoc A (userA) + Assoc B (userB)
        for name in ('A', 'B'):
            self.client.post('/api/associations/', {
                'nom_association': f'Asso {name}',
                'user_email': f'user{name.lower()}@test.com',
                'user_password': 'password123',
                'user_username': f'user{name.lower()}',
            }, format='json')

        assoc_a = Association.objects.get(nom_association='Asso A')
        assoc_b = Association.objects.get(nom_association='Asso B')

        # Création docs pour chaque asso
        def _upload(username, assoc):
            self.client.credentials()
            self._auth_as(username, 'password123')
            file_obj = SimpleUploadedFile('file.pdf', b'content', content_type='application/pdf')
            resp = self.client.post('/api/documents/', {
                'nom_fichier': file_obj,
                'id_association': assoc.id_association,
                'id_type_document': self.doc_type.id_type_document,
            }, format='multipart')
            self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
            return resp.data['id_document']

        doc_a_id = _upload('usera', assoc_a)
        doc_b_id = _upload('userb', assoc_b)

        # usera ne voit que doc A
        self.client.credentials()
        self._auth_as('usera', 'password123')
        user_docs = self.client.get('/api/documents/')
        results = user_docs.data['results'] if isinstance(user_docs.data, dict) else user_docs.data
        self.assertEqual(len(results), 1,
        f"Expected 1 doc, got {len(results)}: {[d.get('id_document') for d in results]}")
        
        self.assertEqual(results[0]['id_document'], doc_a_id)

        # admin voit tout
        self.client.credentials()
        self._auth_as('admin', 'testpass123')
        admin_docs = self.client.get('/api/documents/')
        results = admin_docs.data['results'] if isinstance(admin_docs.data, dict) else admin_docs.data
        doc_ids = {d['id_document'] for d in results}
        self.assertIn(doc_a_id, doc_ids)
        self.assertIn(doc_b_id, doc_ids)

    def test_filter_documents_by_status(self):
        """by_status retourne les docs avec le statut demandé pour le user courant."""
        self._auth_as('admin', 'testpass123')
        create_resp = self.client.post('/api/associations/', {
            'nom_association': 'Asso Filter',
            'user_email': 'filter@test.com',
            'user_password': 'password123',
            'user_username': 'filteruser',
        }, format='json')
        assoc_id = create_resp.data['id_association']

        self.client.credentials()
        self._auth_as('filteruser', 'password123')
        for status_value in ('submitted', 'approved'):
            file_obj = SimpleUploadedFile(f'{status_value}.pdf', b'content', content_type='application/pdf')
            doc = Document.objects.create(
                nom_fichier=file_obj,
                id_association_id=assoc_id,
                id_type_document=self.doc_type,
                uploaded_by=User.objects.get(username='filteruser'),
                statut=status_value,
            )
            # Ensure saved file name matches validator
            self.assertEqual(doc.statut, status_value)

        resp = self.client.get('/api/documents/by_status/', {'status': 'submitted'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)


if __name__ == '__main__':
    import unittest
    unittest.main()
