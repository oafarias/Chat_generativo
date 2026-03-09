document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const protocoloSpan = document.getElementById('protocolo');

    // Gera um protocolo baseado na data (igual ao seu print)
    const data = new Date();
    const protocolo = data.getFullYear() + String(data.getMonth() + 1).padStart(2, '0') + String(data.getDate()).padStart(2, '0') + "02360879";
    protocoloSpan.innerText = protocolo;

    function addMessage(text, type) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = `
            ${type === 'bot' ? '<img src="https://www.gravatar.com/avatar/000?d=mp" class="avatar">' : ''}
            <div class="bubble">${text}</div>
            <span class="time">${time}</span>
        `;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            userInput.value = '';
            
            // Simula resposta do bot após 1 segundo
            setTimeout(() => {
                if(text.toLowerCase() === 'sim') {
                    addMessage("Para prosseguirmos com o atendimento, me informe o seu nome.", "bot");
                }
            }, 1000);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });
});