import json
from google import genai
from google.genai import types
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Acesso, Sessao, Mensagem, Agente

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def chat_home(request):
    ip = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')[:250]
    Acesso.objects.create(ip=ip, user_agent=user_agent)
    return render(request, 'index.html')

@csrf_exempt # Desativa CSRF temporariamente para facilitar o POST via JS
def api_chat(request):
    if request.method == 'GET':
        # Tenta recuperar a sessão ativa (o cache de 24h do Django)
        protocolo = request.session.get('protocolo_ativo')
        if protocolo:
            try:
                sessao = Sessao.objects.get(protocolo=protocolo)
                mensagens = list(sessao.mensagens.values('remetente', 'texto', 'enviado_em'))
                return JsonResponse({'status': 'ativo', 'protocolo': protocolo, 'mensagens': mensagens})
            except Sessao.DoesNotExist:
                pass
        return JsonResponse({'status': 'vazio'})

    elif request.method == 'POST':
        data = json.loads(request.body)
        acao = data.get('acao')

        if acao == 'iniciar':
            # Cria a sessão no banco e amarra ao navegador do usuário
            protocolo = data.get('protocolo')
            Sessao.objects.create(protocolo=protocolo, consentimento_lgpd=True)
            request.session['protocolo_ativo'] = protocolo 
            return JsonResponse({'status': 'ok'})

        elif acao == 'mensagem':
            protocolo = request.session.get('protocolo_ativo')
            if protocolo:
                sessao = Sessao.objects.get(protocolo=protocolo)
                texto_usuario = data.get('texto')

                Mensagem.objects.create(sessao=sessao, remetente='user', texto=texto_usuario)

                agente = Agente.objects.first()
                if not agente:
                    return JsonResponse({'status': 'erro', 'resposta': 'Agente offline.'})

                # 1. Inicia o cliente novo da API
                client = genai.Client(api_key=agente.provedor.api_key)
                
                # 2. Configura a sua criatividade (System Prompt e Temperatura)
                config = types.GenerateContentConfig(
                    system_instruction=agente.system_prompt,
                    temperature=agente.temperatura,
                )

                # 3. Chama a IA
                historico = []
                for msg in sessao.mensagens.all().order_by('enviado_em'):
                    papel = 'user' if msg.remetente == 'user' else 'model'
                    historico.append(types.Content(role=papel, parts=[types.Part.from_text(text=msg.texto)]))
                try:
                    resposta_api = client.models.generate_content(
                        model=agente.provedor.modelo,
                        contents=historico,
                        config=config
                    )
                    texto_bot = resposta_api.text
                except Exception as e:
                    texto_bot = f"Meu cérebro falhou: {e}"

                Mensagem.objects.create(sessao=sessao, remetente='bot', texto=texto_bot)
                return JsonResponse({'status': 'ok', 'resposta': texto_bot})
                
        return JsonResponse({'status': 'erro'})