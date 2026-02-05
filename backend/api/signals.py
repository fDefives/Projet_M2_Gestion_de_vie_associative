from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Mandat, Notification


@receiver(post_save, sender=Mandat)
def create_president_notification(sender, instance, created, **kwargs):
    """
    Créer une notification quand un nouveau mandat de président est créé
    et marquer la notification "président manquant" comme lue
    """
    if created and instance.role_type:
        # Vérifier si c'est un rôle de président
        if ('président' in instance.role_type.name.lower()
                or 'president' in instance.role_type.name.lower()):
            try:
                # Créer une notification
                Notification.objects.create(
                    sujet=f"Changement de président -"
                          f" {instance.association.nom_association}",
                    message=f"Un nouveau président a été ajouté :"
                            f" {instance.membre.prenom}"
                            f" {instance.membre.nom} (à partir"
                            f" du {instance.date_debut})",
                    type="info",
                    id_association=instance.association,
                    is_read=False
                )
                # Marquer la notification "Président manquant" comme lue
                Notification.objects.filter(
                    id_association=instance.association,
                    sujet__icontains="Président manquant",
                ).update(is_read=True)
            except Exception as e:
                print(f"Erreur lors de la création de la notification : {e}")


@receiver(post_save, sender=Mandat)
def update_document_expiration_on_president_change(sender, instance, created, **kwargs):
    """
    Expirer les documents qui expirent au changement de président
    """
    if created and instance.role_type:
        # Vérifier si c'est un rôle de président
        if ('président' in instance.role_type.name.lower() or 'president'
                in instance.role_type.name.lower()):
            try:
                from .models import Document
                from datetime import datetime
                # Récupérer tous les documents de l'association avec le
                # flag expire_si_changement_president
                documents = Document.objects.filter(
                    id_association=instance.association,
                    id_type_document__expire_si_changement_president=True,
                    statut__in=['approved', 'submitted']
                )
                # Marquer les documents comme expirés
                today = datetime.now().date()
                for doc in documents:
                    doc.statut = 'expired'
                    doc.date_expiration = today
                    doc.save()
                # Créer une notification pour les documents expirés
                if documents.exists():
                    Notification.objects.create(
                        sujet=f"Documents expirés - "
                              f"{instance.association.nom_association}",
                        message=f"{documents.count()} "
                                f"document(s) ont expiré suite au"
                                f" changement de président",
                        type="warning",
                        id_association=instance.association,
                        is_read=False
                    )
            except Exception as e:
                print(f"Erreur lors de l'expiration des documents : {e}")
