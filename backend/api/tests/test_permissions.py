import pytest
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model

from api.permissions import (
    IsAdmin,
    IsUser,
    IsAdminOrReadOnly,
    IsAssociationMemberOrAdmin,
    IsDocumentOwnerOrAdmin,
)
from api.models import Association, Document

User = get_user_model()


@pytest.mark.django_db
class TestPermissions:
    def setup_method(self):
        self.factory = APIRequestFactory()

        self.admin = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="pass",
            is_staff=True,
        )

        self.user = User.objects.create_user(
            username="user",
            email="user@test.com",
            password="pass",
            is_staff=False,
        )

        self.association = Association.objects.create(
            nom_association="Test Asso",
            id_utilisateur=self.user,
        )

        self.document = Document.objects.create(
            nom_fichier="test.pdf",
            id_association=self.association,
        )

    # ────────────────────────
    # IsAdmin
    # ────────────────────────
    def test_is_admin_true(self):
        request = self.factory.get("/")
        request.user = self.admin
        assert IsAdmin().has_permission(request, None)

    def test_is_admin_false(self):
        request = self.factory.get("/")
        request.user = self.user
        assert not IsAdmin().has_permission(request, None)

    # ────────────────────────
    # IsUser
    # ────────────────────────
    def test_is_user_true(self):
        request = self.factory.get("/")
        request.user = self.user
        assert IsUser().has_permission(request, None)

    def test_is_user_false_for_admin(self):
        request = self.factory.get("/")
        request.user = self.admin
        assert not IsUser().has_permission(request, None)

    # ────────────────────────
    # IsAdminOrReadOnly
    # ────────────────────────
    def test_read_only_allowed_for_user(self):
        request = self.factory.get("/")
        request.user = self.user
        assert IsAdminOrReadOnly().has_permission(request, None)

    def test_write_allowed_for_admin(self):
        request = self.factory.post("/")
        request.user = self.admin
        assert IsAdminOrReadOnly().has_permission(request, None)

    def test_write_denied_for_user(self):
        request = self.factory.post("/")
        request.user = self.user
        assert not IsAdminOrReadOnly().has_permission(request, None)

    # ────────────────────────
    # IsAssociationMemberOrAdmin
    # ────────────────────────
    def test_association_access_admin(self):
        request = self.factory.get("/")
        request.user = self.admin
        assert IsAssociationMemberOrAdmin().has_object_permission(
            request, None, self.document
        )

    def test_association_access_owner(self):
        request = self.factory.get("/")
        request.user = self.user
        assert IsAssociationMemberOrAdmin().has_object_permission(
            request, None, self.document
        )

    def test_association_access_denied(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="pass",
        )
        request = self.factory.get("/")
        request.user = other_user
        assert not IsAssociationMemberOrAdmin().has_object_permission(
            request, None, self.document
        )

    # ────────────────────────
    # IsDocumentOwnerOrAdmin
    # ────────────────────────
    def test_document_access_admin(self):
        request = self.factory.get("/")
        request.user = self.admin
        assert IsDocumentOwnerOrAdmin().has_object_permission(
            request, None, self.document
        )

    def test_document_access_owner(self):
        request = self.factory.get("/")
        request.user = self.user
        assert IsDocumentOwnerOrAdmin().has_object_permission(
            request, None, self.document
        )

    def test_document_access_denied(self):
        other_user = User.objects.create_user(
            username="other2",
            email="other2@test.com",
            password="pass",
        )
        request = self.factory.get("/")
        request.user = other_user
        assert not IsDocumentOwnerOrAdmin().has_object_permission(
            request, None, self.document
        )
