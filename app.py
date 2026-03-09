from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    # Renderiza o HTML da pasta /templates
    return """<h1>Hello World!</h1><p>Se voce esta vendo isso o CI/CD funcionou!</p>"""

if __name__ == '__main__':
    # Rodando em 0.0.0.0 para ser acessível dentro do container Docker
    app.run(host='0.0.0.0', port=5000)