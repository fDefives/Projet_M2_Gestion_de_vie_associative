import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile

from api.models import (
    Association,
    AssociationType,
    Document,
    TypeDocument,
    Notification,
)

User = get_user_model()


# --------------------
# USERS
# --------------------

@pytest.fixture
def normal_user(db):
    return User.objects.create_user(
        username="user_test",
        email="user_test@example.com",
        password="password123",
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username="admin_test",
        email="admin_test@example.com",
        password="admin123",
    )


# --------------------
# API CLIENTS
# --------------------

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def api_client_auth(normal_user):
    client = APIClient()
    client.force_authenticate(user=normal_user)
    return client


@pytest.fixture
def api_client_admin(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


# --------------------
# ASSOCIATION
# --------------------

@pytest.fixture
def association_type(db):
    return AssociationType.objects.create(name="BDE")


@pytest.fixture
def association(db, normal_user, association_type):
    return Association.objects.create(
        nom_association="Association Test",
        id_utilisateur=normal_user,
        association_type=association_type,
    )


# --------------------
# DOCUMENT
# --------------------

@pytest.fixture
def type_document(db):
    return TypeDocument.objects.create(
        libelle="Statuts",
        obligatoire=True,
    )


@pytest.fixture
def document(db, association, type_document, normal_user):
    file = SimpleUploadedFile(
        "test.pdf",
        b"dummy content",
        content_type="application/pdf",
    )

    return Document.objects.create(
        nom_fichier=file,
        id_association=association,
        id_type_document=type_document,
        uploaded_by=normal_user,
        statut="submitted",
    )


# --------------------
# NOTIFICATION
# --------------------

@pytest.fixture
def notification(db, association):
    return Notification.objects.create(
        sujet="Test",
        message="Message de test",
        id_association=association,
        is_read=False,
    )
