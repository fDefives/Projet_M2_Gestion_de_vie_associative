import pytest
from django.contrib.auth import get_user_model
from api.models import Association, TypeDocument, Document
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
def test_user_cannot_access_other_association_documents():
    client = APIClient()

    User.objects.create_user(username="admin", email="a@test.com", password="pass", is_staff=True)
    user1 = User.objects.create_user(username="u1", email="u1@test.com", password="pass")
    user2 = User.objects.create_user(username="u2", email="u2@test.com", password="pass")

    Association.objects.create(nom_association="A1", id_utilisateur=user1)
    assoc2 = Association.objects.create(nom_association="A2", id_utilisateur=user2)

    dtype = TypeDocument.objects.create(libelle="Statuts")

    Document.objects.create(
        nom_fichier="doc1.pdf",
        id_association=assoc2,
        id_type_document=dtype,
        uploaded_by=user2
    )

    client.force_authenticate(user=user1)
    resp = client.get("/api/documents/")
    assert resp.status_code == 200
    assert len(resp.data) == 0

