from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    UserRegistrationView,
    AssociationViewSet,
    AssociationTypeViewSet,
    MembreViewSet,
    DocumentViewSet,
    TypeDocumentViewSet,
    NotificationViewSet,
    MandatViewSet,
    RoleTypeViewSet,
)

router = DefaultRouter()
router.register(r"users", UserRegistrationView, basename="user")
router.register(r"associations", AssociationViewSet, basename="association")
router.register(
    r"association-types", AssociationTypeViewSet, basename="association-type"
)
router.register(r"membres", MembreViewSet, basename="membre")
router.register(r"documents", DocumentViewSet, basename="document")
router.register(r"type-documents", TypeDocumentViewSet, basename="type-document")
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"mandats", MandatViewSet, basename="mandat")
router.register(r"role-types", RoleTypeViewSet, basename="role-type")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
