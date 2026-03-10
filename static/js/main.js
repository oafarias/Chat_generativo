document.addEventListener('DOMContentLoaded', async () => {
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

    userInput.disabled = true; 
    sendBtn.disabled = true;

    // ==========================================
    // INTEGRAÇÃO COM A API DO DJANGO (BACKEND)
    // ==========================================
    async function apiCarregarHistorico() {
        try {
            const res = await fetch('/api/chat/');
            return await res.json();
        } catch (e) { console.error("Erro ao buscar histórico", e); return null; }
    }

    async function apiIniciarSessao(protocolo) {
        await fetch('/api/chat/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ acao: 'iniciar', protocolo: protocolo })
        });
    }

    async function apiSalvarMensagem(remetente, texto) {
        await fetch('/api/chat/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ acao: 'mensagem', remetente: remetente, texto: texto })
        });
    }
    // ==========================================

    // 2. Restauração de Sessão ou Fluxo Novo
    const historico = await apiCarregarHistorico();

    if (historico && historico.status === 'ativo') {
        // Usuário já tem sessão ativa (Deu F5 na página)
        lgpdModal.style.display = "none";
        userHasConsented = true;
        userInput.disabled = false;
        sendBtn.disabled = false;
        if (protocoloSpan) protocoloSpan.innerText = historico.protocolo;

        // Carrega as mensagens antigas sem salvar de novo no banco
        historico.mensagens.forEach(msg => {
            addMessage(msg.texto, msg.remetente, false, false); 
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        // Fluxo normal de novo usuário
        checkCookieConsent();
    }

    function checkCookieConsent() {
        if (document.cookie.includes("lgpd_consent=true")) {
            lgpdModal.style.display = "none";
            unlockChat();
        } else {
            lgpdModal.style.display = "flex";
        }
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

    function unlockChat() {
        userHasConsented = true;
        userInput.disabled = true;
        sendBtn.disabled = true;
        playNotification(); 
        
        const msgInicial = `
            Você concorda em fornecer informações pessoais para continuarmos o atendimento?<br><br>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button id="btn-chat-sim" class="btn-primary" style="padding: 6px 16px; font-size: 13px;">Sim</button>
                <button id="btn-chat-nao" class="btn-secondary" style="padding: 6px 16px; font-size: 13px;">Não</button>
            </div>
        `;
        addMessage(msgInicial, "bot", false); // false = não salva essa msg interativa no banco

        setTimeout(() => {
            const btnChatSim = document.getElementById('btn-chat-sim');
            const btnChatNao = document.getElementById('btn-chat-nao');

            if (btnChatSim) {
                btnChatSim.addEventListener('click', async () => {
                    btnChatSim.parentElement.style.display = 'none';
                    addMessage("Sim", "user", false);

                    userInput.disabled = false;
                    sendBtn.disabled = false;
                    userInput.focus();

                    const novoProtocolo = gerarProtocolo();
                    if (protocoloSpan) protocoloSpan.innerText = novoProtocolo;

                    // Cria a sessão real no Banco de Dados
                    await apiIniciarSessao(novoProtocolo);

                    setTimeout(() => {
                        const msgBot = `O seu protocolo para este atendimento é: <strong>${novoProtocolo}</strong>.<br>Para prosseguirmos com o atendimento, me informe o seu nome.`;
                        addMessage(msgBot, "bot", true); // true = agora começa a salvar!
                    }, 800);
                });
            }

            if (btnChatNao) {
                btnChatNao.addEventListener('click', () => {
                    btnChatNao.parentElement.style.display = 'none';
                    addMessage("Não", "user", false);
                    setTimeout(() => {
                        addMessage("Sem o consentimento, não podemos prosseguir com o atendimento. Recarregue a página caso mude de ideia.", "bot", false);
                    }, 800);
                });
            }
        }, 100);
    }

    // 3. Sistema de Som 
    function playNotification() {
        if (!isMuted && userHasConsented) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
            audio.volume = 0.4;
            audio.play().catch(e => console.log("Áudio pendente de interação."));
        }
    }

    function gerarProtocolo() {
        const agora = new Date();
        const dataPrefix = agora.getFullYear() + 
                           String(agora.getMonth() + 1).padStart(2, '0') + 
                           String(agora.getDate()).padStart(2, '0');
        const randomValidacao = Math.floor(100000 + Math.random() * 900000);
        return `${dataPrefix}${randomValidacao}`;
    }

    // 4. Função Adicionar Mensagens (Agora conectada ao DB)
    function addMessage(text, type, salvarBD = true, tocarSom = true) {
        let msgTextoFormatado = text;
        
        // Se for restauração, a hora vem do banco, senão gera na hora
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = `
            ${type === 'bot' ? '<img src="https://mkbr.xgen.com.br/mkbr/chatng/assets/img/avatar-aiwa.png" class="avatar">' : ''}
            <div class="bubble">${msgTextoFormatado}</div>
            <span class="time">${time}</span>
        `;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        if (type === 'bot' && tocarSom) {
            playNotification();
        }

        // Se for mensagem oficial do fluxo, joga pro Django salvar
        if (salvarBD) {
            apiSalvarMensagem(type, text);
        }
    }

    // 5. Eventos de Envio
    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) {
            addMessage(text, 'user', true); // Salva input do usuario
            userInput.value = '';
            
            setTimeout(() => {
                if(text.toLowerCase().includes('sim')) {
                    // Aqui sua IA vai assumir depois, isso é só o mock
                    addMessage("Entendido, prosseguindo com o atendimento...", "bot", true);
                } else {
                    addMessage("Recebi sua mensagem. Em que posso ajudar?", "bot", true);
                }
            }, 1000);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    // 6. Lógica de Volume e Emojis (Mantidas iguais)
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            volumeBtn.innerText = isMuted ? '🔇' : '🔊';
            volumeBtn.style.color = isMuted ? '#999' : '#666';
        });
    }

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
});