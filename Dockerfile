FROM python:3.11-slim

# Instala dependências de sistema (caso precise compilar pacotes no futuro)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia e instala requirements primeiro (melhora o cache do Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]