FROM python:3.11-slim

# Instala dependências de sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Cria o usuário ANTES de copiar os arquivos
RUN useradd -ms /bin/bash django-user

# Copia e instala requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia o projeto
COPY . .

# 2. Garante que a pasta db_data exista para o chown não falhar
RUN mkdir -p /app/db_data

# 3. Dá a permissão de dono para o usuário não-root
RUN chown -R django-user:django-user /app

# 4. Troca para o usuário seguro
USER django-user

# 5. O comando principal fica por ÚLTIMO
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:5000 core.wsgi:application"]