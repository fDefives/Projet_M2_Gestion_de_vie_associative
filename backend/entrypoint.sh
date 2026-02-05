#!/bin/bash
set -e

echo "Waiting for database..."
until python - <<'PY'
import socket,sys,os
h=os.environ.get('DB_HOST','db')
p=int(os.environ.get('DB_PORT',5432))
try:
    s=socket.socket()
    s.settimeout(1)
    s.connect((h,p))
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
PY
do
  echo "  still waiting..."
  sleep 1
done

# Si une commande est passée au conteneur, on l'exécute
if [ "$#" -gt 0 ]; then
  echo "Running passed command: $@"
  exec "$@"
fi

echo "Checking if database is already initialized..."

DB_INITIALIZED=$(python manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute(\"\"\"
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'django_migrations'
        );
    \"\"\")
    print(cursor.fetchone()[0])
")

if [ "$DB_INITIALIZED" = "True" ]; then
  echo "Database already initialized. Skipping migrations and init."
else
  echo "Database not initialized. Running migrations..."

  echo "Making migrations for 'api'..."
  python manage.py makemigrations api --noinput || true

  echo "Applying migrations..."
  python manage.py migrate --noinput

  if [ "${DEBUG:-False}" = "True" ]; then
    echo "Initializing test data..."
    python manage.py init_db || true
  else
    echo "DEBUG is False. Skipping init_db."
  fi
fi

echo "Starting server..."
python manage.py collectstatic --noinput
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-3}" \
  --timeout "${GUNICORN_TIMEOUT:-120}"
