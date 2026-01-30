import pytest
from django.contrib.auth import get_user_model

from api.models import Association, AssociationType, Document, TypeDocument

User = get_user_model()


@pytest.mark.django_db
def test_custom_user_email_unique():
    User.objects.create_user(username="u1", email="a@test.com", password="pass")
    with pytest.raises(Exception):
        User.objects.create_user(username="u2", email="a@test.com", password="pass")


@pytest.mark.django_db
def test_association_string_representation():
    atype = AssociationType.objects.create(name="Culture")
    assoc = Association.objects.create(
        nom_association="Test Asso", association_type=atype
    )
    assert str(assoc) == "Test Asso"


@pytest.mark.django_db
def test_document_default_status():
    user = User.objects.create_user(username="u", email="u@test.com", password="pass")
    AssociationType.objects.create(name="Sport")
    assoc = Association.objects.create(nom_association="A", id_utilisateur=user)
    dtype = TypeDocument.objects.create(libelle="Statuts")

    doc = Document.objects.create(
        nom_fichier="test.pdf",
        id_association=assoc,
        id_type_document=dtype,
        uploaded_by=user,
    )

    assert doc.statut == "submitted"
