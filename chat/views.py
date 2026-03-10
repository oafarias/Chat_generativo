from django.shortcuts import render
from .models import Acesso

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def chat_home(request):
    # Salva o log de acesso (IP, Hora, Navegador)
    ip = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')[:250] # Limita tamanho
    
    Acesso.objects.create(ip=ip, user_agent=user_agent)

    return render(request, 'index.html')