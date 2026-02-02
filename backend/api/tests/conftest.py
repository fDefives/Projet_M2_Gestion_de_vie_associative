import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client_auth(normal_user):
    client = APIClient()
    client.force_authenticate(user=normal_user)
    return client
