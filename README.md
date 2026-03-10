# 🤖 AIWA Chat Generativo (Multiagente)

Sistema de atendimento inteligente utilizando Django, Docker e Google Gemini API.

## 🚀 Como Rodar Localmente (.venv)
1. Ative o ambiente virtual: `source .venv/bin/activate` (ou via Script no Windows).
2. Instale as dependências: `pip install -r requirements.txt`
3. Crie a pasta do banco: `mkdir db_data` (Essencial para não dar erro de SQLite).
4. Migre o banco: `python manage.py migrate`
5. Crie seu acesso: `python manage.py createsuperuser`
6. Rode: `python manage.py runserver 5000`

## 🐳 Como Rodar em Produção (Docker)
O deploy é automático via GitHub Actions, mas para subir manualmente:
```bash
docker compose up -d --build
docker exec -it app-web-1 python manage.py migrate
```

Para criar um usuário no docker use o comando:
```bash
docker exec -it app-web-1 python manage.py createsuperuser
```
```bash
Chat_generativo/
├── chat/                   # Seu App (Onde a mágica acontece)
│   ├── migrations/         # Histórico do banco
│   ├── admin.py            # Config do painel
│   ├── models.py           # Estrutura da IA (Agentes/Provedores)
│   ├── views.py            # Lógica do Orquestrador e Gemini
│   └── urls.py             # Rotas do chat
├── core/                   # Configurações do Django
│   ├── settings.py         # Config de banco e apps
│   ├── urls.py             # Rota principal (admin/ e api/)
│   └── wsgi.py             # Deploy
├── db_data/                # Banco de Dados (Persistente)
│   └── db.sqlite3
├── static/                 # CSS e JS
│   ├── css/style.css
│   └── js/main.js          # Seu código Javascript
├── templates/
│   └── index.html          # Sua interface
├── docker-compose.yml      # Configuração do servidor
├── Dockerfile              # Receita do container
└── requirements.txt        # Lista de bibliotecas (google-genai, etc.)
```
