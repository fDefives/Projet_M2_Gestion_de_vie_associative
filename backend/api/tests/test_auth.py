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


@pytest.mark.django_db
def test_me_authenticated(api_client, normal_user):
    api_client.force_authenticate(user=normal_user)
    resp = api_client.get("/api/users/me/")
    assert resp.status_code == 200
    assert resp.data["username"] == "user_test"


@pytest.mark.django_db
def test_change_password_success(api_client, normal_user):
    api_client.force_authenticate(user=normal_user)
    resp = api_client.post(
        "/api/users/change_password/",
        {
            "old_password": "password123",
            "new_password": "NewStrong123",
            "new_password2": "NewStrong123",
        },
    )
    assert resp.status_code == 200


@pytest.mark.django_db
def test_password_reset_request_without_email(api_client):
    resp = api_client.post("/api/users/password_reset_request/", {})
    assert resp.status_code == 400


@pytest.mark.django_db
def test_password_reset_confirm_invalid_token(api_client, normal_user):
    resp = api_client.post(
        "/api/users/password_reset_confirm/",
        {
            "uidb64": "invalid",
            "token": "invalid",
            "new_password": "NewPass123",
            "new_password2": "NewPass123",
        },
    )
    assert resp.status_code == 400
