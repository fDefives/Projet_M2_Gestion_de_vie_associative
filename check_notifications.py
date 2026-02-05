#!/usr/bin/env python
import os
import django
from api.models import Notification, Association, Mandat, RoleType
from django.utils import timezone
from django.db.models import Q
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
today = timezone.now().date()

print("=== Toutes les associations ===")
for assoc in Association.objects.all():
    print(f"  ID {assoc.id_association}: {assoc.nom_association}")

print("\n=== Rôle Président ===")
try:
    president_role = RoleType.objects.get(name="Président")
    print(f"  Trouvé: ID {president_role.id}")
except RoleType.DoesNotExist:
    print("  NON TROUVÉ")
    print(f"  Rôles disponibles: "
          f"{list(RoleType.objects.values_list('name', flat=True))}")

print("\n=== Mandats Président actifs ===")
try:
    president_role = RoleType.objects.get(name="Président")
    mandats = Mandat.objects.filter(
        role_type=president_role,
        statut="active"
    ).filter(
        Q(date_fin__isnull=True) | Q(date_fin__gte=today)
    )
    print(f"  Total: {mandats.count()}")
    for mandat in mandats:
        print(f"    {mandat.association.nom_association}: {mandat.membre.prenom}"
              f" {mandat.membre.nom}")
except RoleType.DoesNotExist:
    print("  Rôle Président non trouvé")

print("\n=== Notifications Président ===")
notifs = Notification.objects.filter(sujet__icontains="Président")
print(f"  Total: {notifs.count()}")
for notif in notifs:
    print(f"    ID {notif.id_notification}: {notif.sujet} "
          f"(assoc_id={notif.id_association_id}, is_read={notif.is_read})")

print("\n=== Toutes les notifications ===")
print(f"  Total: {Notification.objects.count()}")
for notif in Notification.objects.all()[:20]:
    print(f"    ID {notif.id_notification}: {notif.sujet} (is_read={notif.is_read})")
