import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_create_association_without_user_data_fails():
    client = APIClient()
    admin = User.objects.create_user(username="admin", email="a@test.com", password="pass", is_staff=True)
    client.force_authenticate(user=admin)

    resp = client.post("/api/associations/", {
        "nom_association": "Asso sans user"
    })

    assert resp.status_code == 400
    assert "user" in resp.data
