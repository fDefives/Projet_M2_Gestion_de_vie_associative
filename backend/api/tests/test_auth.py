import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
def test_jwt_login_success():
    client = APIClient()
    User.objects.create_user(username="test", email="t@test.com", password="pass")

    resp = client.post("/api/auth/login/", {"username": "test", "password": "pass"})

    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data


@pytest.mark.django_db
def test_jwt_login_failure():
    client = APIClient()
    resp = client.post("/api/auth/login/", {"username": "unknown", "password": "wrong"})

    assert resp.status_code == 401
