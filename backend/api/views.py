from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from .serializers import UpdateProfileSerializer
from django.contrib.auth import get_user_model
from django.http import FileResponse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db import models
from datetime import timedelta
import os

from .models import (
    Association,
    AssociationType,
    Membre,
    TypeDocument,
    Document,
    Notification,
    Mandat,
    RoleType,
)
from .serializers import (
    MandatSerializer,
    RoleTypeSerializer,
    CustomUserSerializer,
    CustomUserCreateSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    AssociationTypeSerializer,
    AssociationSerializer,
    MembreSerializer,
    TypeDocumentSerializer,
    DocumentSerializer,
    NotificationSerializer,
)
from .permissions import IsAdmin, IsAdminOrReadOnly, IsDocumentOwnerOrAdmin

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vue personnalisée pour l'authentification"""

    pass


class UserRegistrationView(viewsets.ModelViewSet):
    """ViewSet pour l'enregistrement et la gestion des utilisateurs"""

    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = []
    pagination_class = None

    def get_serializer_class(self):
        if self.action == "create":
            return CustomUserCreateSerializer
        elif self.action == "change_password":
            return ChangePasswordSerializer
        elif self.action == "password_reset_request":
            return PasswordResetRequestSerializer
        elif self.action == "password_reset_confirm":
            return PasswordResetConfirmSerializer
        elif self.action == "update_profile":
            return UpdateProfileSerializer
        return CustomUserSerializer

    @action(detail=False, methods=["post"], permission_classes=[])
    def register(self, request):
        """Endpoint d'enregistrement pour les nouveaux utilisateurs"""
        serializer = CustomUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Utilisateur créé avec succès"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False, methods=["get", "patch"],
        permission_classes=[permissions.IsAuthenticated]
    )
    def me(self, request):
        """
        GET: Retourne les infos de l'utilisateur connecté
        PATCH: Met à jour le profil de l'utilisateur connecté
        """
        if request.method == "GET":
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == "PATCH":
            serializer = UpdateProfileSerializer(
                request.user,
                data=request.data,
                partial=True,
                context={"request": request},
            )
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "message": "Profil mis à jour avec succès",
                        "user": CustomUserSerializer(request.user).data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["patch"],
        permission_classes=[IsAuthenticated],
    )
    def update_profile(self, request):
        """
        Permet à l'utilisateur connecté (user ou admin)
        de modifier son email, prénom et nom.

        PATCH /api/users/update_profile/
        """
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Profil mis à jour avec succès",
                    "user": CustomUserSerializer(request.user).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def change_password(self, request):
        """
        Endpoint pour changer le mot de passe de l'utilisateur connecté

        POST /api/users/change_password/
        Body: {
            "old_password": "ancien_mot_de_passe",
            "new_password": "nouveau_mot_de_passe",
            "new_password2": "nouveau_mot_de_passe"
        }
        """
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Mot de passe changé avec succès"},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], permission_classes=[])
    def password_reset_request(self, request):
        """
        Demande de réinitialisation de mot de passe.
        Envoie un email avec un lien de reset si l'utilisateur existe.

        POST /api/users/password_reset_request/
        Body: {"email": "user@example.com"}
        """
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "L'email est requis."}, status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

            send_mail(
                "Réinitialisation de votre mot de passe",
                f"Bonjour {user.username},\n\n"
                f"Vous avez demandé la réinitialisation de votre mot de passe.\n\n"
                f"Cliquez sur le lien suivant pour réinitialiser votre mot de passe"
                f" :\n{reset_url}\n\n"
                f"Si vous n'avez pas demandé cette réinitialisation, "
                f"ignorez cet email.\n\n"
                f"Ce lien expirera dans 24 heures.",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

        # Réponse neutre pour la sécurité (évite de confirmer l'existence d'un compte)
        return Response(
            {
                "message": "Si un compte existe avec cet email, "
                "un message de réinitialisation a été envoyé."
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], permission_classes=[])
    def password_reset_confirm(self, request):
        """
        Confirmation du reset de mot de passe avec le token reçu par email.

        POST /api/users/password_reset_confirm/
        Body: {
            "uidb64": "encoded_user_id",
            "token": "reset_token",
            "new_password": "nouveau_mot_de_passe",
            "new_password2": "nouveau_mot_de_passe"
        }
        """
        uidb64 = request.data.get("uidb64")
        token = request.data.get("token")

        if not uidb64 or not token:
            return Response(
                {"error": "uidb64 et token sont requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Lien de réinitialisation invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Le lien de réinitialisation a expiré ou est invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_password = request.data.get("new_password")
        new_password2 = request.data.get("new_password2")

        if not new_password or not new_password2:
            return Response(
                {"error": "Les deux mots de passe sont requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != new_password2:
            return Response(
                {"error": "Les mots de passe ne correspondent pas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"error": "Le mot de passe doit contenir au moins 8 caractères."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Mot de passe réinitialisé avec succès."},
            status=status.HTTP_200_OK,
        )

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAdmin()]
        elif self.action in ["create", "register"]:
            return []
        elif self.action in ["update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()


class AssociationViewSet(viewsets.ModelViewSet):
    """ViewSet pour les associations"""

    queryset = Association.objects.all()
    serializer_class = AssociationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Filtre les associations selon le rôle"""
        user = self.request.user
        if user.is_staff:
            return Association.objects.all()
        # Les utilisateurs ne voient que leur association
        return Association.objects.filter(id_utilisateur=user)

    def perform_create(self, serializer):
        """Création association : crée systématiquement un utilisateur dédié
        (email + mot de passe obligatoires)."""
        email = self.request.data.get("user_email") or self.request.data.get("email")
        password = self.request.data.get("user_password") or self.request.data.get(
            "password"
        )
        username_raw = self.request.data.get("user_username") or self.request.data.get(
            "username"
        )

        if not email or not password:
            raise serializers.ValidationError(
                {
                    "user": (
                        "email et mot de passe sont obligatoires "
                        "pour créer le compte associé"
                    )
                }
            )

        # Génère un username si absent (à partir de l'email) en garantissant l'unicité
        base_username = username_raw or email.split("@")[0]
        candidate = base_username
        suffix = 1
        while User.objects.filter(username=candidate).exists():
            candidate = f"{base_username}{suffix}"
            suffix += 1

        new_user = User(
            email=email,
            username=candidate,
            is_active=True,
        )
        new_user.set_password(password)
        new_user.save()

        serializer.save(id_utilisateur=new_user)

    @action(
        detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def documents(self, request, pk=None):
        """Récupère tous les documents d'une association"""
        association = self.get_object()
        documents = association.documents.all()

        # Si l'utilisateur n'est pas admin, il ne voit que ses documents
        if not request.user.is_staff:
            documents = documents.filter(id_association__id_utilisateur=request.user)

        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def members(self, request, pk=None):
        """Récupère tous les membres d'une association"""
        association = self.get_object()

        # Vérifie l'accès pour les non-admins
        if not request.user.is_staff and association.id_utilisateur != request.user:
            return Response(
                {"detail": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN
            )

        members = Membre.objects.filter(mandats__association_id=pk).distinct()
        serializer = MembreSerializer(members, many=True)
        return Response(serializer.data)


class MembreViewSet(viewsets.ModelViewSet):
    """ViewSet pour les membres - indépendants des associations"""

    queryset = Membre.objects.all()
    serializer_class = MembreSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Retourne tous les membres - ils sont indépendants des associations"""
        return Membre.objects.all()

    def perform_create(self, serializer):
        """Crée un membre avec seulement prenom et nom"""
        serializer.save()


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet pour les documents - Cœur de la logique rôles"""

    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrAdmin]
    pagination_class = None

    def get_queryset(self):
        """
        Logique de filtrage des documents selon le rôle:
        - Admin: voit tous les documents de toutes les associations
        - User: voit uniquement les documents de son association
        """
        user = self.request.user

        if user.is_staff:
            # L'admin voit tous les documents
            return (
                Document.objects.all()
                .select_related(
                    "id_association",
                    "id_type_document",
                    "uploaded_by",
                )
            )

        # L'utilisateur voit seulement les documents de son association
        return (
            Document.objects.filter(
                id_association__id_utilisateur=user
            )
            .select_related(
                "id_association",
                "id_type_document",
                "uploaded_by",
            )
        )

    def perform_create(self, serializer):
        """Ajoute le document avec l'utilisateur connecté et expire les
        anciens documents du même type"""
        # Récupérer les données avant la sauvegarde
        id_association = serializer.validated_data.get('id_association')
        id_type_document = serializer.validated_data.get('id_type_document')
        # Marquer les anciens documents du même type comme expirés
        if id_association and id_type_document:
            Document.objects.filter(
                id_association=id_association,
                id_type_document=id_type_document,
            ).exclude(
                statut='expired'  # Ne pas modifier ceux déjà expirés
            ).update(
                statut='expired'
            )
        # Sauvegarder le nouveau document
        serializer.save(uploaded_by=self.request.user)

    @action(
        detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def my_documents(self, request):
        """Récupère uniquement les documents de l'utilisateur connecté"""
        if request.user.is_staff:
            documents = Document.objects.all()
        else:
            documents = Document.objects.filter(
                id_association__id_utilisateur=request.user
            )

        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def by_association(self, request):
        """Récupère les documents d'une association spécifique"""
        association_id = request.query_params.get("association_id")

        if not association_id:
            return Response(
                {"error": "association_id est requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.is_staff:
            # Vérifie que l'utilisateur a accès à cette association
            association = Association.objects.filter(
                id_association=association_id, id_utilisateur=request.user
            ).first()
            if not association:
                return Response(
                    {"error": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN
                )

        documents = Document.objects.filter(id_association_id=association_id)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def by_status(self, request):
        """Récupère les documents filtrés par statut"""
        status_filter = request.query_params.get("status")

        if not status_filter:
            return Response(
                {"error": "status est requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset()
        documents = queryset.filter(statut=status_filter)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=["patch"], permission_classes=[permissions.IsAuthenticated]
    )
    def approve(self, request, pk=None):
        """Approuve un document (Admin seulement)"""
        if not request.user.is_staff:
            return Response(
                {"error": "Seuls les admins peuvent approuver"},
                status=status.HTTP_403_FORBIDDEN,
            )

        document = self.get_object()
        document.statut = "approved"
        document.save()

        serializer = self.get_serializer(document)
        return Response(serializer.data)

    @action(
        detail=True, methods=["patch"], permission_classes=[permissions.IsAuthenticated]
    )
    def reject(self, request, pk=None):
        """Rejette un document (Admin seulement)"""
        if not request.user.is_staff:
            return Response(
                {"error": "Seuls les admins peuvent rejeter"},
                status=status.HTTP_403_FORBIDDEN,
            )

        document = self.get_object()
        document.statut = "rejected"
        document.commentaire_refus = request.data.get("commentaire_refus", "")
        document.save()

        serializer = self.get_serializer(document)
        return Response(serializer.data)

    @action(
        detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def download(self, request, pk=None):
        """Télécharge un document"""
        document = self.get_object()

        # Vérifier les permissions
        if (
            not request.user.is_staff
            and document.id_association.id_utilisateur != request.user
        ):
            return Response(
                {"error": "Vous n'avez pas la permission de télécharger ce document"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Retourner le fichier
        if document.nom_fichier and os.path.exists(document.nom_fichier.path):
            response = FileResponse(document.nom_fichier.open("rb"))
            response["Content-Disposition"] = (
                f'attachment; filename="{os.path.basename(document.nom_fichier.name)}"'
            )
            return response
        else:
            return Response(
                {"error": "Fichier introuvable"}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, *args, **kwargs):
        """Supprime un document (propriétaire ou admin)"""
        document = self.get_object()

        # Vérification des permissions
        if (
            not request.user.is_staff
            and document.id_association.id_utilisateur != request.user
        ):
            return Response(
                {"error": "Vous n'avez pas la permission de supprimer ce document"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)


class TypeDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet pour les types de documents"""

    queryset = TypeDocument.objects.all()
    serializer_class = TypeDocumentSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet pour les notifications"""

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def _ensure_expiration_notifications(self, associations):
        """Crée des notifications pour les documents expirant bientôt"""
        today = timezone.now().date()
        warning_limit = today + timedelta(days=60)

        documents = (
            Document.objects.filter(
                id_association__in=associations,
                date_expiration__isnull=False,
                date_expiration__gt=today,
                date_expiration__lte=warning_limit,
                statut__in=["approved", "submitted"],
            )
            .select_related("id_type_document", "id_association")
        )

        for doc in documents:
            if not doc.id_type_document:
                continue
            replacement_exists = Document.objects.filter(
                id_association=doc.id_association,
                id_type_document=doc.id_type_document,
                statut__in=["submitted", "approved"],
                date_depot__gt=doc.date_depot,
            ).exists()

            expiration_str = doc.date_expiration.strftime("%d/%m/%Y")
            subject = (
                f"Document à renouveler - {doc.id_association.nom_association}"
            )
            message = (
                f"Le document {doc.id_type_document.libelle} (ID {doc.id_document}) "
                f"expire le {expiration_str}. Merci de le renouveler."
            )

            if replacement_exists:
                Notification.objects.filter(
                    id_association=doc.id_association,
                    message__icontains=f"ID {doc.id_document}",
                ).update(is_read=True)
                continue

            notification, created = Notification.objects.get_or_create(
                id_association=doc.id_association,
                sujet=subject,
                message=message,
                defaults={"type": "warning", "is_read": False},
            )
            if not created and notification.is_read:
                notification.is_read = False
                notification.save(update_fields=["is_read"])

    def _ensure_president_notifications(self, associations):
        """Crée des notifications pour les associations sans président"""
        today = timezone.now().date()

        for association in associations:
            # Chercher le rôle "Président" exactement
            try:
                president_role = RoleType.objects.get(name="Président")
                has_active_president = Mandat.objects.filter(
                    association=association,
                    statut="active",
                    role_type=president_role,
                    date_debut__lte=today,
                ).filter(
                    models.Q(date_fin__isnull=True) | models.Q(date_fin__gte=today)
                ).exists()
            except RoleType.DoesNotExist:
                has_active_president = False

            subject = f"Président manquant - {association.nom_association}"
            message = (
                f"L'association {association.nom_association} n'a pas de président "
                f"actif. "
                f"Merci d'ajouter un président."
            )

            if not has_active_president:
                notification, created = Notification.objects.get_or_create(
                    id_association=association,
                    sujet=subject,
                    message=message,
                    defaults={"type": "error", "is_read": False},
                )
                if not created and notification.is_read:
                    notification.is_read = False
                    notification.save(update_fields=["is_read"])
            else:
                Notification.objects.filter(
                    id_association=association,
                    sujet=subject,
                ).update(is_read=True)

    def _ensure_mandatory_documents_notifications(self, associations):
        """Crée des notifications pour les documents obligatoires manquants"""
        today = timezone.now().date()

        # Récupérer tous les types de documents obligatoires
        mandatory_types = TypeDocument.objects.filter(obligatoire=True)

        for association in associations:
            for doc_type in mandatory_types:
                # Vérifier si un document valide de ce type existe
                has_valid_document = Document.objects.filter(
                    id_association=association,
                    id_type_document=doc_type,
                    statut__in=["submitted", "approved"],
                ).filter(
                    models.Q(date_expiration__isnull=True) |
                    models.Q(date_expiration__gte=today)
                ).exists()

                subject = (f"Document obligatoire manquant - "
                           f"{association.nom_association}")
                message = (
                    f"L'association {association.nom_association} n'a pas "
                    f"déposé le document obligatoire "
                    f"\"{doc_type.libelle}\". Merci de le déposer dès que possible."
                )

                if not has_valid_document:
                    # Créer ou réactiver la notification
                    notification, created = Notification.objects.get_or_create(
                        id_association=association,
                        sujet=subject,
                        message=message,
                        defaults={"type": "warning", "is_read": False},
                    )
                    if not created and notification.is_read:
                        notification.is_read = False
                        notification.save(update_fields=["is_read"])
                else:
                    # Marquer comme lu si le document a été déposé
                    Notification.objects.filter(
                        id_association=association,
                        sujet=subject,
                        message__icontains=doc_type.libelle,
                    ).update(is_read=True)

    def get_queryset(self):
        """Filtre les notifications selon le rôle"""
        user = self.request.user
        if user.is_staff:
            associations = Association.objects.all()
            self._ensure_expiration_notifications(associations)
            self._ensure_president_notifications(associations)
            self._ensure_mandatory_documents_notifications(associations)
            return Notification.objects.all()
        # Les utilisateurs ne voient que les notifications de leur association
        associations = Association.objects.filter(id_utilisateur=user)
        self._ensure_expiration_notifications(associations)
        self._ensure_president_notifications(associations)
        self._ensure_mandatory_documents_notifications(associations)
        return Notification.objects.filter(id_association__id_utilisateur=user)

    @action(
        detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def mark_as_read(self, request):
        """Marque les notifications comme lues"""
        notification_ids = request.data.get("ids", [])
        Notification.objects.filter(
            id_notification__in=notification_ids
        ).update(is_read=True)

        return Response({"message": "Notifications marquées comme lues"})

    @action(
        detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def unread(self, request):
        """Récupère les notifications non lues"""
        queryset = self.get_queryset()
        unread = queryset.filter(is_read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)


class AssociationTypeViewSet(viewsets.ModelViewSet):
    """ViewSet pour les types d'associations"""

    queryset = AssociationType.objects.all()
    serializer_class = AssociationTypeSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None


class RoleTypeViewSet(viewsets.ModelViewSet):
    """ViewSet pour les types de rôles"""

    queryset = RoleType.objects.all()
    serializer_class = RoleTypeSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None


class MandatViewSet(viewsets.ModelViewSet):
    """ViewSet pour les mandats - Gestion des rôles par association"""

    queryset = Mandat.objects.all()
    serializer_class = MandatSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Filtre les mandats selon le rôle et l'association passée en query param"""
        user = self.request.user
        association_id = self.request.query_params.get("association_id")

        if user.is_staff:
            qs = Mandat.objects.all().select_related(
                "membre", "association", "role_type"
            )
        else:
            # Les utilisateurs ne voient que les mandats de leur association
            qs = (
                Mandat.objects.filter(
                    association__id_utilisateur=user
                )
                .select_related(
                    "membre",
                    "association",
                    "role_type",
                )
            )

        if association_id:
            qs = qs.filter(association_id=association_id)

        return qs

    def perform_create(self, serializer):
        """Crée un mandat et expire les documents si changement de président"""

        mandat = serializer.save()

        # Vérifier si le rôle est Président et actif
        if (
                mandat.role_type
                and mandat.role_type.name.lower() == "président"
                and mandat.statut == "active"
        ):
            association = mandat.association

            # Expirer les documents concernés
            Document.objects.filter(
                id_association=association,
                id_type_document__expire_si_changement_president=True,
            ).exclude(
                statut="expired"
            ).update(
                statut="expired"
            )

    @action(
        detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def by_association(self, request):
        """Récupère les mandats d'une association spécifique"""
        association_id = request.query_params.get("association_id")

        if not association_id:
            return Response(
                {"error": "association_id est requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.is_staff:
            # Vérifie que l'utilisateur a accès à cette association
            association = Association.objects.filter(
                id_association=association_id, id_utilisateur=request.user
            ).first()
            if not association:
                return Response(
                    {"error": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN
                )

        mandats = (
            Mandat.objects.filter(
                association_id=association_id
            )
            .select_related(
                "membre",
                "association",
                "role_type",
            )
        )

        serializer = self.get_serializer(mandats, many=True)
        return Response(serializer.data)

    @action(
        detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def by_membre(self, request):
        """Récupère les mandats d'un membre spécifique"""
        membre_id = request.query_params.get("membre_id")

        if not membre_id:
            return Response(
                {"error": "membre_id est requis"}, status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset()
        mandats = queryset.filter(membre_id=membre_id)
        serializer = self.get_serializer(mandats, many=True)
        return Response(serializer.data)
