document.addEventListener('DOMContentLoaded', () => {
    // 1. Seletores de Elementos
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const protocoloSpan = document.getElementById('protocolo');
    const lgpdModal = document.getElementById('lgpd-modal');
    const btnSim = document.getElementById('btn-lgpd-sim');
    const btnNao = document.getElementById('btn-lgpd-nao');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPickerBox = document.getElementById('emoji-picker-box');
    const volumeBtn = document.getElementById('volume-btn');

    let isMuted = false;
    let userHasConsented = false;

    userInput.disabled = true; // Desabilita o input até o usuário consentir
    sendBtn.disabled = true;

    // 2. Lógica LGPD
    function checkCookieConsent() {
        if (document.cookie.includes("lgpd_consent=true")) {
            lgpdModal.style.display = "none";
            unlockChat();
        } else {
            lgpdModal.style.display = "flex";
        }
    }

    function unlockChat() {
        userHasConsented = true;
        
        // Mantém o input de texto bloqueado até ele responder a pergunta do bot
        userInput.disabled = true;
        sendBtn.disabled = true;
        
        playNotification(); 
        
        // Monta a mensagem com os botões embutidos
        const msgInicial = `
            Você concorda em fornecer informações pessoais para continuarmos o atendimento?<br><br>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button id="btn-chat-sim" class="btn-primary" style="padding: 6px 16px; font-size: 13px;">Sim</button>
                <button id="btn-chat-nao" class="btn-secondary" style="padding: 6px 16px; font-size: 13px;">Não</button>
            </div>
        `;
        addMessage(msgInicial, "bot");

        // Adiciona os eventos para os botões que acabaram de ser criados no chat
        setTimeout(() => {
            const btnChatSim = document.getElementById('btn-chat-sim');
            const btnChatNao = document.getElementById('btn-chat-nao');

            if (btnChatSim) {
                btnChatSim.addEventListener('click', () => {
                    // Oculta os botões após o clique
                    btnChatSim.parentElement.style.display = 'none';
                    addMessage("Sim", "user");

                    // Libera o campo de digitação
                    userInput.disabled = false;
                    sendBtn.disabled = false;
                    userInput.focus();

                    // Gera o protocolo e segue o fluxo
                    const novoProtocolo = gerarProtocolo();
                    setTimeout(() => {
                        addMessage(`O seu protocolo para este atendimento é: <strong>${novoProtocolo}</strong>.<br>Para prosseguirmos com o atendimento, me informe o seu nome.`, "bot");
                    }, 800);
                });
            }

            if (btnChatNao) {
                btnChatNao.addEventListener('click', () => {
                    btnChatNao.parentElement.style.display = 'none';
                    addMessage("Não", "user");
                    setTimeout(() => {
                        addMessage("Sem o consentimento, não podemos prosseguir com o atendimento. Recarregue a página caso mude de ideia.", "bot");
                    }, 800);
                });
            }
        }, 100);
    }

    btnSim.addEventListener('click', () => {
        const d = new Date();
        d.setTime(d.getTime() + (24*60*60*1000));
        document.cookie = `lgpd_consent=true;expires=${d.toUTCString()};path=/`;
        lgpdModal.style.display = "none";
        unlockChat();
    });

    btnNao.addEventListener('click', () => {
        alert("Para prosseguir com o atendimento, precisamos do seu consentimento para uso de dados essenciais.");
    });

    checkCookieConsent();

    // 3. Sistema de Som 
    function playNotification() {
        if (!isMuted && userHasConsented) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            audio.volume = 0.4;
            audio.play().catch(e => console.log("Áudio pendente de interação."));
        }
    }

    // 4. Lógica do Protocolo
    function gerarProtocolo() {
        const agora = new Date();
        const dataPrefix = agora.getFullYear() + 
                           String(agora.getMonth() + 1).padStart(2, '0') + 
                           String(agora.getDate()).padStart(2, '0');
        const randomValidacao = Math.floor(100000 + Math.random() * 900000);
        return `${dataPrefix}${randomValidacao}`;
    }

    
    

    // 5. Função para Adicionar Mensagens
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

    // 6. Eventos de Envio
    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            userInput.value = '';
            
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

    // 7. Lógica de Volume
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            volumeBtn.innerText = isMuted ? '🔇' : '🔊';
            volumeBtn.style.color = isMuted ? '#999' : '#666';
        });
    }

    // 8. Lógica do Seletor de Emojis
    if (emojiBtn && emojiPickerBox) {
        emojiPickerBox.classList.add('emoji-picker-hidden');

        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPickerBox.classList.toggle('emoji-picker-hidden');
        });

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
})