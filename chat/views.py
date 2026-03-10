import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Acesso, Sessao, Mensagem

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
            # Salva a mensagem direto na sessão vinculada
            protocolo = request.session.get('protocolo_ativo')
            if protocolo:
                sessao = Sessao.objects.get(protocolo=protocolo)
                Mensagem.objects.create(
                    sessao=sessao,
                    remetente=data.get('remetente'),
                    texto=data.get('texto')
                )
                return JsonResponse({'status': 'ok'})
                
        return JsonResponse({'status': 'erro'})