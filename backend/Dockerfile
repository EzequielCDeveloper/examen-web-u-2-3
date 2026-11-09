FROM python:3.12-slim

# Evitar escritura de .pyc y habilitar logs en tiempo real sin búfer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema requeridas para librerías nativas (psycopg2, lxml, zeep)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libxml2-dev \
    libxslt1-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente del backend
COPY . /app/

# Recolectar archivos estáticos
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Ejecutar con servidor WSGI de producción (Gunicorn)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "anime_backend.wsgi:application"]
