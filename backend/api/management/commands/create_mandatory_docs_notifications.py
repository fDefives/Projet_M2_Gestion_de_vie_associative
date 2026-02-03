"""
Management command pour créer des notifications pour tous les documents obligatoires manquants
"""

from django.core.management.base import BaseCommand
from django.db import models
from django.utils import timezone
from api.models import Association, TypeDocument, Document, Notification


class Command(BaseCommand):
    help = "Crée des notifications pour tous les documents obligatoires manquants"

    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # Récupérer tous les types de documents obligatoires
        mandatory_types = TypeDocument.objects.filter(obligatoire=True)
        
        if not mandatory_types.exists():
            self.stdout.write(
                self.style.WARNING("Aucun type de document obligatoire trouvé")
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Types de documents obligatoires : {', '.join([dt.libelle for dt in mandatory_types])}"
            )
        )
        
        associations = Association.objects.all()
        notifications_created = 0
        notifications_skipped = 0
        
        for association in associations:
            for doc_type in mandatory_types:
                # Vérifier si un document valide de ce type existe
                has_valid_document = Document.objects.filter(
                    id_association=association,
                    id_type_document=doc_type,
                    statut__in=["submitted", "approved"],
                ).filter(
                    models.Q(date_expiration__isnull=True) | models.Q(date_expiration__gte=today)
                ).exists()
                
                if not has_valid_document:
                    subject = f"Document obligatoire manquant - {association.nom_association}"
                    message = (
                        f"L'association {association.nom_association} n'a pas déposé le document obligatoire "
                        f'"{doc_type.libelle}". Merci de le déposer dès que possible.'
                    )
                    
                    # Créer ou réactiver la notification
                    notification, created = Notification.objects.get_or_create(
                        id_association=association,
                        sujet=subject,
                        message=message,
                        defaults={"type": "warning", "is_read": False},
                    )
                    
                    if created:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"✓ Notification créée pour {association.nom_association} - {doc_type.libelle}"
                            )
                        )
                        notifications_created += 1
                    elif notification.is_read:
                        notification.is_read = False
                        notification.save(update_fields=["is_read"])
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"✓ Notification réactivée pour {association.nom_association} - {doc_type.libelle}"
                            )
                        )
                        notifications_created += 1
                    else:
                        self.stdout.write(
                            f"○ Notification déjà existante pour {association.nom_association} - {doc_type.libelle}"
                        )
                        notifications_skipped += 1
                else:
                    self.stdout.write(
                        f"○ {association.nom_association} a déjà le document {doc_type.libelle}"
                    )
                    notifications_skipped += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f"\n✓ Terminé : {notifications_created} notification(s) créée(s)/réactivée(s), "
                f"{notifications_skipped} ignorée(s)"
            )
        )
