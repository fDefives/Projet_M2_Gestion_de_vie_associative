import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from api.models import Association, TypeDocument, Document

User = get_user_model()


@pytest.mark.django_db
def test_only_admin_can_approve_document():
    client = APIClient()

    admin = User.objects.create_user(
        username="admin", email="a@test.com", password="pass", is_staff=True
    )
    user = User.objects.create_user(
        username="user", email="u@test.com", password="pass"
    )

    assoc = Association.objects.create(nom_association="Asso", id_utilisateur=user)
    dtype = TypeDocument.objects.create(libelle="Statuts")

    doc = Document.objects.create(
        nom_fichier="doc.pdf",
        id_association=assoc,
        id_type_document=dtype,
        uploaded_by=user,
    )

    # user interdit
    client.force_authenticate(user=user)
    resp = client.patch(f"/api/documents/{doc.id_document}/approve/")
    assert resp.status_code == 403

    # admin autorisé
    client.force_authenticate(user=admin)
    resp = client.patch(f"/api/documents/{doc.id_document}/approve/")
    assert resp.status_code == 200
    assert resp.data["statut"] == "approved"
