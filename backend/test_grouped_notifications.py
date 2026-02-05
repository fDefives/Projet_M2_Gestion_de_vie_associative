#!/usr/bin/env python
"""Script pour tester l'API des notifications avec le nouveau champ association_name"""
import os
import sys
import django
from api.models import Notification
from api.serializers import NotificationSerializer
import json

# Configuration Django
sys.path.insert(0, '/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
print("=" * 80)
print("TEST API NOTIFICATIONS - Groupement par association")
print("=" * 80)

# Récupérer quelques notifications non lues
notifications = Notification.objects.filter(is_read=False)[:5]

print(f"\n📋 Notifications non lues: {notifications.count()}")

# Sérialiser les notifications
serializer = NotificationSerializer(notifications, many=True)

# Afficher le résultat

print("\n📤 Données sérialisées (format API):")
print(json.dumps(serializer.data, indent=2, ensure_ascii=False))

# Grouper par association
grouped = {}
for notif_data in serializer.data:
    assoc_name = notif_data.get('association_name', 'Unknown')
    if assoc_name not in grouped:
        grouped[assoc_name] = []
    grouped[assoc_name].append(notif_data['message'])

print("\n🗂️  Groupement par association:")
for assoc_name, messages in grouped.items():
    print(f"\n   {assoc_name} ({len(messages)} notification(s)):")
    for msg in messages:
        # Extraire juste le type de document
        if '"' in msg:
            doc_type = msg.split('"')[1]
            print(f"      - {doc_type}")
        else:
            print(f"      - {msg[:60]}...")

print("\n" + "=" * 80)
