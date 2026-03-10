from django.db import models
from django.utils import timezone

class Acesso(models.Model):
    ip = models.GenericIPAddressField(verbose_name="Endereço IP")
    data_hora = models.DateTimeField(auto_now_add=True, verbose_name="Data e Hora")
    user_agent = models.CharField(max_length=255, blank=True, null=True, verbose_name="Navegador/Dispositivo")

    def __str__(self):
        return f"Acesso #{self.id} | IP: {self.ip} | {self.data_hora.strftime('%d/%m %H:%M')}"

class Sessao(models.Model):
    protocolo = models.CharField(max_length=20, unique=True, verbose_name="Número do Protocolo")
    criado_em = models.DateTimeField(default=timezone.now, verbose_name="Início do Atendimento")
    consentimento_lgpd = models.BooleanField(default=False, verbose_name="Aceitou Termos?")

    def __str__(self):
        return f"Protocolo: {self.protocolo}"

class Mensagem(models.Model):
    REMETENTE_CHOICES = [
        ('user', 'Usuário'),
        ('bot', 'AIWA Bot'),
    ]
    sessao = models.ForeignKey(Sessao, on_delete=models.CASCADE, related_name='mensagens')
    remetente = models.CharField(max_length=10, choices=REMETENTE_CHOICES)
    texto = models.TextField()
    enviado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_remetente_display()} - {self.texto[:30]}..."