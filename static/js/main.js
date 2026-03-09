document.addEventListener('DOMContentLoaded', () => {
    // 1. Seletores de Elementos
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const protocoloSpan = document.getElementById('protocolo');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPickerBox = document.getElementById('emoji-picker-box');
    const volumeBtn = document.getElementById('volume-btn');

    let isMuted = false;

    // 2. Lógica do Protocolo (Data + 6 dígitos aleatórios)
    function gerarProtocolo() {
        const agora = new Date();
        const dataPrefix = agora.getFullYear() + 
                           String(agora.getMonth() + 1).padStart(2, '0') + 
                           String(agora.getDate()).padStart(2, '0');
        const randomValidacao = Math.floor(100000 + Math.random() * 900000);
        return `${dataPrefix}${randomValidacao}`;
    }

    if (protocoloSpan) {
        protocoloSpan.innerText = gerarProtocolo();
    }

    // 3. Sistema de Som
    function playNotification() {
        if (!isMuted) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            audio.volume = 0.4;
            audio.play().catch(() => {
                console.log("Áudio bloqueado pelo navegador. Interaja com a página primeiro.");
            });
        }
    }

    // 4. Função para Adicionar Mensagens
    function addMessage(text, type) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = `
            ${type === 'bot' ? '<img src="https://mkbr.xgen.com.br/mkbr/chatng/assets/img/avatar-aiwa.png" class="avatar">' : ''}
            <div class="bubble">${text}</div>
            <span class="time">${time}</span>
        `;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        if (type === 'bot') {
            playNotification();
        }
    }

    // 5. Eventos de Envio
    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            userInput.value = '';
            
            // Simulação de resposta do Bot
            setTimeout(() => {
                if(text.toLowerCase().includes('sim')) {
                    addMessage("Para prosseguirmos com o atendimento, me informe o seu nome.", "bot");
                }
            }, 1000);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    // 6. Lógica de Volume
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            volumeBtn.innerText = isMuted ? '🔇' : '🔊';
            volumeBtn.style.color = isMuted ? '#999' : '#666';
        });
    }

    // 7. Lógica do Seletor de Emojis
    if (emojiBtn && emojiPickerBox) {
        // Garante que comece escondido
        emojiPickerBox.classList.add('emoji-picker-hidden');

        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPickerBox.classList.toggle('emoji-picker-hidden');
        });

        // Fecha ao clicar fora
        document.addEventListener('click', () => {
            emojiPickerBox.classList.add('emoji-picker-hidden');
        });

        emojiPickerBox.addEventListener('click', (e) => e.stopPropagation());

        emojiPickerBox.addEventListener('emoji-click', event => {
            const emoji = event.detail.unicode;
            const startPos = userInput.selectionStart;
            const endPos = userInput.selectionEnd;

            userInput.value = userInput.value.substring(0, startPos) + emoji + userInput.value.substring(endPos);
            userInput.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
            userInput.focus();
        });
    }
});