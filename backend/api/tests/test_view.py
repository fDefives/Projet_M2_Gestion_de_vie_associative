# conftest.py
import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from api.models import (
    Association,
    AssociationType,
    RoleType,
    Membre,
    Document,
    TypeDocument,
    Notification,
    Mandat,
)

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email="admin@test.com", username="admin", password="adminpass"
    )


@pytest.fixture
def normal_user(db):
    return User.objects.create_user(
        email="user@test.com", username="user", password="userpass"
    )


@pytest.fixture
def association_type(db):
    return AssociationType.objects.create(name="BDE")


@pytest.fixture
def association(db, normal_user, association_type):
    return Association.objects.create(
        nom_association="Asso Test",
        id_utilisateur=normal_user,
        association_type=association_type,
    )


@pytest.fixture
def membre(db):
    return Membre.objects.create(prenom="Jean", nom="Dupont", statut_membre="active")


@pytest.fixture
def type_document(db):
    return TypeDocument.objects.create(libelle="Statuts", obligatoire=True)


@pytest.fixture
def document(db, association, type_document, normal_user):
    file = SimpleUploadedFile(
        "test.pdf", b"file_content", content_type="application/pdf"
    )

    return Document.objects.create(
        nom_fichier=file,
        id_association=association,
        id_type_document=type_document,
        uploaded_by=normal_user,
        statut="submitted",
    )


@pytest.fixture
def notification(db, association):
    return Notification.objects.create(
        sujet="Test", message="Message", id_association=association
    )


@pytest.fixture
def role_type(db):
    return RoleType.objects.create(name="Président")


@pytest.fixture
def mandat(db, membre, association, role_type):
    return Mandat.objects.create(
        membre=membre,
        association=association,
        role_type=role_type,
        date_debut="2024-01-01",
    )


@pytest.mark.django_db
def test_register_user(api_client):
    response = api_client.post(
        "/api/users/register/",
        {"email": "new@test.com", "username": "new", "password": "StrongPass123"},
    )
    assert response.status_code == 201


def test_me_requires_auth(api_client):
    response = api_client.get("/api/users/me/")
    assert response.status_code == 401
