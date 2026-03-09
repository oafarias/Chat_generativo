// Efeito de digitação (Typewriter)
const text = "O CI/CD está rodando perfeitamente e seguro com HTTPS.";
const typewriterElement = document.getElementById("typewriter");
let i = 0;

function typeWriter() {
    if (i < text.length) {
        typewriterElement.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
    }
}

// Inicia o efeito quando a página carrega
window.onload = typeWriter;

// Botão interativo
document.getElementById('action-btn').addEventListener('click', () => {
    alert("Conexão estabelecida com sucesso! Seu pipeline é incrível. 🚀");
});