from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .models import Association, AssociationType, Membre, TypeDocument, Document, Notification
from .serializers import (
    CustomUserSerializer,
    CustomUserCreateSerializer,
    AssociationTypeSerializer,
    AssociationSerializer,
    MembreSerializer,
    TypeDocumentSerializer,
    DocumentSerializer,
    NotificationSerializer
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

    def get_serializer_class(self):
        if self.action == 'create':
            return CustomUserCreateSerializer
        return CustomUserSerializer

    @action(detail=False, methods=['post'], permission_classes=[])
    def register(self, request):
        """Endpoint d'enregistrement pour les nouveaux utilisateurs"""
        serializer = CustomUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Utilisateur créé avec succès"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Retourne les infos de l'utilisateur connecté"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdmin()]
        elif self.action in ['create', 'register']:
            return []
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()


class AssociationViewSet(viewsets.ModelViewSet):
    """ViewSet pour les associations"""
    queryset = Association.objects.all()
    serializer_class = AssociationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtre les associations selon le rôle"""
        user = self.request.user
        if user.is_staff:
            return Association.objects.all()
        # Les utilisateurs ne voient que leur association
        return Association.objects.filter(id_utilisateur=user)

    def perform_create(self, serializer):
        """Création association : crée systématiquement un utilisateur dédié (email + mot de passe obligatoires)."""
        email = self.request.data.get('user_email') or self.request.data.get('email')
        password = self.request.data.get('user_password') or self.request.data.get('password')
        username_raw = self.request.data.get('user_username') or self.request.data.get('username')

        if not email or not password:
            raise serializers.ValidationError({'user': 'email et mot de passe sont obligatoires pour créer le compte associé'})

        # Génère un username si absent (à partir de l'email) en garantissant l'unicité
        base_username = username_raw or email.split('@')[0]
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

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def documents(self, request, pk=None):
        """Récupère tous les documents d'une association"""
        association = self.get_object()
        documents = association.documents.all()
        
        # Si l'utilisateur n'est pas admin, il ne voit que ses documents
        if not request.user.is_staff:
            documents = documents.filter(id_association__id_utilisateur=request.user)
        
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def members(self, request, pk=None):
        """Récupère tous les membres d'une association"""
        association = self.get_object()
        members = association.membres.all()
        serializer = MembreSerializer(members, many=True)
        return Response(serializer.data)


class MembreViewSet(viewsets.ModelViewSet):
    """ViewSet pour les membres des associations"""
    queryset = Membre.objects.all()
    serializer_class = MembreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtre les membres selon le rôle"""
        user = self.request.user
        if user.is_staff:
            return Membre.objects.all()
        # Les utilisateurs ne voient que les membres de leur association
        return Membre.objects.filter(id_association__id_utilisateur=user)

    def perform_create(self, serializer):
        """Crée un membre"""
        serializer.save()


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet pour les documents - Cœur de la logique rôles"""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDocumentOwnerOrAdmin]

    def get_queryset(self):
        """
        Logique de filtrage des documents selon le rôle:
        - Admin: voit tous les documents de toutes les associations
        - User: voit uniquement les documents de son association
        """
        user = self.request.user
        
        if user.is_staff:
            # L'admin voit tous les documents
            return Document.objects.all().select_related('id_association', 'id_type_document', 'uploaded_by')
        
        # L'utilisateur voit seulement les documents de son association
        return Document.objects.filter(
            id_association__id_utilisateur=user
        ).select_related('id_association', 'id_type_document', 'uploaded_by')

    def perform_create(self, serializer):
        """Ajoute le document avec l'utilisateur connecté"""
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_documents(self, request):
        """Récupère uniquement les documents de l'utilisateur connecté"""
        if request.user.is_staff:
            documents = Document.objects.all()
        else:
            documents = Document.objects.filter(id_association__id_utilisateur=request.user)
        
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def by_association(self, request):
        """Récupère les documents d'une association spécifique"""
        association_id = request.query_params.get('association_id')
        
        if not association_id:
            return Response(
                {"error": "association_id est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.is_staff:
            # Vérifie que l'utilisateur a accès à cette association
            association = Association.objects.filter(
                id_association=association_id,
                id_utilisateur=request.user
            ).first()
            if not association:
                return Response(
                    {"error": "Accès refusé"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        documents = Document.objects.filter(id_association_id=association_id)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def by_status(self, request):
        """Récupère les documents filtrés par statut"""
        status_filter = request.query_params.get('status')
        
        if not status_filter:
            return Response(
                {"error": "status est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset()
        documents = queryset.filter(statut=status_filter)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        """Approuve un document (Admin seulement)"""
        if not request.user.is_staff:
            return Response(
                {"error": "Seuls les admins peuvent approuver"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        document = self.get_object()
        document.statut = 'approved'
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        """Rejette un document (Admin seulement)"""
        if not request.user.is_staff:
            return Response(
                {"error": "Seuls les admins peuvent rejeter"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        document = self.get_object()
        document.statut = 'rejected'
        document.commentaire_refus = request.data.get('commentaire_refus', '')
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Supprime un document (propriétaire ou admin)"""
        document = self.get_object()
        
        # Vérification des permissions
        if not request.user.is_staff and document.id_association.id_utilisateur != request.user:
            return Response(
                {"error": "Vous n'avez pas la permission de supprimer ce document"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


class TypeDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet pour les types de documents"""
    queryset = TypeDocument.objects.all()
    serializer_class = TypeDocumentSerializer
    permission_classes = [IsAdminOrReadOnly]


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet pour les notifications"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtre les notifications selon le rôle"""
        user = self.request.user
        if user.is_staff:
            return Notification.objects.all()
        # Les utilisateurs ne voient que les notifications de leur association
        return Notification.objects.filter(id_association__id_utilisateur=user)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_as_read(self, request):
        """Marque les notifications comme lues"""
        notification_ids = request.data.get('ids', [])
        Notification.objects.filter(id_notification__in=notification_ids).update(is_read=True)
        return Response({"message": "Notifications marquées comme lues"})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
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
