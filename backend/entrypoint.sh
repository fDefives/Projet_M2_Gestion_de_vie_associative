#!/bin/sh
set -e

echo "Waiting for database..."
# loop until python can open a socket to the DB
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

# If a command is passed, run it (useful for one-off manage.py commands)
if [ "$#" -gt 0 ]; then
  echo "Running passed command: $@"
  exec "$@"
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Initializing test data (if any)..."
if python -c "import importlib, sys
try:
    importlib.import_module('api.management.commands.init_db')
    sys.exit(0)
except Exception:
    sys.exit(1)
"; then
  python manage.py init_db || true
fi

echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000
