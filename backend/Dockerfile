FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
   PYTHONUNBUFFERED=1 \
   DJANGO_SETTINGS_MODULE=config.settings

WORKDIR /app

# Dépendances système
RUN apt-get update \
   && apt-get install -y --no-install-recommends \
   bash \
   ca-certificates \
   curl \
   wget \
   && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code applicatif
COPY . .
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
