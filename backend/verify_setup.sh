#!/usr/bin/env bash
# Script de vérification de l'installation et de la configuration

set -e

echo "======================================"
echo "🔍 Vérification de l'Installation API"
echo "======================================"
echo ""

# Vérifier Python
echo "✓ Vérification Python..."
python --version
echo ""

# Vérifier les dépendances installées
echo "✓ Vérification des dépendances..."
python -m pip list | grep -E "Django|djangorestframework|djangorestframework-simplejwt|psycopg2|django-cors"
echo ""

# Vérifier la base de données
echo "✓ Vérification de la configuration Django..."
python manage.py check
echo ""

# Lister les modèles
echo "✓ Modèles disponibles:"
python -c "
from django.apps import apps
for model in apps.get_models():
    if 'api' in model.__module__:
        print(f'  - {model._meta.verbose_name} ({model.__name__})')
"
echo ""

# Vérifier les URLs
echo "✓ URLs disponibles:"
python manage.py show_urls | head -30
echo ""

echo "======================================"
echo "✅ Vérification complétée!"
echo "======================================"
echo ""
echo "Prochaines étapes:"
echo "  1. Lancer les migrations: python manage.py migrate"
echo "  2. Initialiser les données: python manage.py init_db"
echo "  3. Démarrer le serveur: python manage.py runserver"
echo ""
