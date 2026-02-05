from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from api.models import Association, Mandat, RoleType, Notification


class Command(BaseCommand):
    help = "Create missing president notifications for associations without an active president"

    def handle(self, *args, **options):
        today = timezone.now().date()

        try:
            president_role = RoleType.objects.get(name="Président")
        except RoleType.DoesNotExist:
            self.stdout.write(self.style.ERROR("Rôle Président non trouvé"))
            return

        for association in Association.objects.all():
            has_active_president = Mandat.objects.filter(
                association=association,
                statut="active",
                role_type=president_role,
                date_debut__lte=today,
            ).filter(
                Q(date_fin__isnull=True) | Q(date_fin__gte=today)
            ).exists()

            subject = f"Président manquant - {association.nom_association}"
            message = (
                f"L'association {association.nom_association} n'a pas de président actif. "
                f"Merci d'ajouter un président."
            )

            if not has_active_president:
                notification, created = Notification.objects.get_or_create(
                    id_association=association,
                    sujet=subject,
                    message=message,
                    defaults={"type": "error", "is_read": False},
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Created notification for {association.nom_association}"
                        )
                    )
                elif notification.is_read:
                    notification.is_read = False
                    notification.save(update_fields=["is_read"])
                    self.stdout.write(
                        self.style.WARNING(
                            f"⚠ Reset notification for {association.nom_association}"
                        )
                    )
            else:
                # Mark as read if president exists
                Notification.objects.filter(
                    id_association=association,
                    sujet=subject,
                ).update(is_read=True)
                self.stdout.write(
                    f"○ {association.nom_association} has a president"
                )
