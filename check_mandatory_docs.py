#!/usr/bin/env python
"""Script pour vérifier les notifications des documents obligatoires"""
import os
import sys
import django
from api.models import Association, TypeDocument, Document, Notification
from django.utils import timezone
from django.db import models

# Configuration Django
sys.path.insert(0, '/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
today = timezone.now().date()
print("=" * 80)
print("VÉRIFICATION DES NOTIFICATIONS DOCUMENTS OBLIGATOIRES")
print("=" * 80)

# Types de documents obligatoires
mandatory_types = TypeDocument.objects.filter(obligatoire=True)
print(f"\n📋 Types de documents obligatoires: {mandatory_types.count()}")
for dt in mandatory_types:
    print(f"   - {dt.libelle}")

# Notifications actives (non lues) pour documents obligatoires
notifications = Notification.objects.filter(
    is_read=False,
    sujet__icontains="Document obligatoire manquant"
).select_related('id_association')

print(f"\n🔔 Notifications actives: {notifications.count()}")
for notif in notifications:
    print(f"   - {notif.id_association.nom_association}: {notif.message}")

# Associations sans documents obligatoires
print("\n📊 État par association:")
associations = Association.objects.all()

for assoc in associations:
    print(f"\n   {assoc.nom_association}:")
    for doc_type in mandatory_types:
        has_doc = Document.objects.filter(
            id_association=assoc,
            id_type_document=doc_type,
            statut__in=["submitted", "approved"],
        ).filter(
            models.Q(date_expiration__isnull=True)
            | models.Q(date_expiration__gte=today)
        ).exists()
        status = "✓ Déposé" if has_doc else "✗ Manquant"
        print(f"      {doc_type.libelle}: {status}")

print("\n" + "=" * 80)
