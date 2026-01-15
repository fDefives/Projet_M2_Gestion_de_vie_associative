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

if [ "$#" -gt 0 ]; then
  echo "Running passed command: $@"
  exec "$@"
fi

echo "Running migrations..."
echo "Making migrations for 'api'..."
python manage.py makemigrations api --noinput || true
echo "Applying migrations..."
python manage.py migrate --noinput

echo "Initializing test data..."
python manage.py init_db || true

echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000