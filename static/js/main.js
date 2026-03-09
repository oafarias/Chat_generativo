document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const protocoloSpan = document.getElementById('protocolo');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPickerBox = document.getElementById('emoji-picker-box');

    // Gera um protocolo baseado na data
    const data = new Date();
    const protocolo = data.getFullYear() + String(data.getMonth() + 1).padStart(2, '0') + String(data.getDate()).padStart(2, '0') + "02360879";
    if(protocoloSpan) protocoloSpan.innerText = protocolo;

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
    }

    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            userInput.value = '';
            
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

    // Lógica do Seletor de Emojis
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPickerBox.classList.toggle('emoji-picker-hidden');
    });

    document.addEventListener('click', () => {
        emojiPickerBox.classList.add('emoji-picker-hidden');
    });

    emojiPickerBox.addEventListener('click', (e) => { e.stopPropagation(); });

    emojiPickerBox.addEventListener('emoji-click', event => {
        const emoji = event.detail.unicode;
        const startPos = userInput.selectionStart;
        const endPos = userInput.selectionEnd;

        userInput.value = userInput.value.substring(0, startPos) + emoji + userInput.value.substring(endPos);
        userInput.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
        userInput.focus();
    });
});