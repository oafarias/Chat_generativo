from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return """<h1>Hello World!</h1><p>Se voce esta vendo isso o CI/CD funcionou!</p>"""

if __name__ == '__main__':
    app.run(host='0.0.0.0', port = 5000)