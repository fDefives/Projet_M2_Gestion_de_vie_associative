import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from api.models import Association, TypeDocument, Document

User = get_user_model()


@pytest.mark.django_db
def test_user_cannot_access_other_association_documents():
    client = APIClient()

    User.objects.create_user(
        username="admin", email="a@test.com", password="pass", is_staff=True
    )
    user1 = User.objects.create_user(
        username="u1", email="u1@test.com", password="pass"
    )
    user2 = User.objects.create_user(
        username="u2", email="u2@test.com", password="pass"
    )

    Association.objects.create(nom_association="A1", id_utilisateur=user1)
    assoc2 = Association.objects.create(nom_association="A2", id_utilisateur=user2)

    dtype = TypeDocument.objects.create(libelle="Statuts")

    Document.objects.create(
        nom_fichier="doc1.pdf",
        id_association=assoc2,
        id_type_document=dtype,
        uploaded_by=user2,
    )

    client.force_authenticate(user=user1)
    resp = client.get("/api/documents/")
    assert resp.status_code == 200
    assert len(resp.data) == 0


@pytest.mark.django_db
def test_association_documents_non_admin(api_client, association, normal_user):
    api_client.force_authenticate(user=normal_user)
    resp = api_client.get(f"/api/associations/{association.id_association}/documents/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_association_members_forbidden(api_client, association):
    other = User.objects.create_user(
        username="x", email="x@test.com", password="pass"
    )
    api_client.force_authenticate(user=other)

    resp = api_client.get(
        f"/api/associations/{association.id_association}/members/"
    )
    assert resp.status_code == 404


@pytest.mark.django_db
def test_reject_document_admin(api_client, document, admin_user):
    api_client.force_authenticate(user=admin_user)
    resp = api_client.patch(
        f"/api/documents/{document.id_document}/reject/",
        {"commentaire_refus": "Non conforme"},
    )
    assert resp.status_code == 200
    assert resp.data["statut"] == "rejected"


@pytest.mark.django_db
def test_download_document_not_found(api_client, document, normal_user):
    document.nom_fichier.delete(save=True)
    api_client.force_authenticate(user=normal_user)
    resp = api_client.get(f"/api/documents/{document.id_document}/download/")
    assert resp.status_code == 404


@pytest.mark.django_db
def test_unread_notifications(api_client, notification, normal_user):
    api_client.force_authenticate(user=normal_user)
    resp = api_client.get("/api/notifications/unread/")
    assert resp.status_code == 200
