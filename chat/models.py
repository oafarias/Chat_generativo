from django.db import models
from django.utils import timezone

class Acesso(models.Model):
    ip = models.GenericIPAddressField(verbose_name="Endereço IP")
    data_hora = models.DateTimeField(auto_now_add=True, verbose_name="Data e Hora")
    user_agent = models.CharField(max_length=255, blank=True, null=True, verbose_name="Navegador/Dispositivo")

    def __str__(self):
        return f"Acesso #{self.id} | IP: {self.ip} | {self.data_hora.strftime('%d/%m %H:%M')}"
    
    class Meta:
        verbose_name = "Acesso"
        verbose_name_plural = "Acessos"
        ordering = ['-data_hora']

class Sessao(models.Model):
    protocolo = models.CharField(max_length=20, unique=True, verbose_name="Número do Protocolo")
    criado_em = models.DateTimeField(default=timezone.now, verbose_name="Início do Atendimento")
    consentimento_lgpd = models.BooleanField(default=False, verbose_name="Aceitou Termos?")

    def __str__(self):
        return f"Protocolo: {self.protocolo}"
    
    class Meta:
        verbose_name = "Sessão de Chat"
        verbose_name_plural = "Sessões de Chat"
        ordering = ['-criado_em']

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
    
class ProvedorIA(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Provedor (ex: OpenAI, Google)")
    modelo = models.CharField(max_length=100, verbose_name="Modelo (ex: gpt-4o)")
    api_key = models.CharField(max_length=255, verbose_name="API Key")

    def __str__(self):
        return f"{self.nome} ({self.modelo})"

    class Meta:
        verbose_name = "Provedor de IA"
        verbose_name_plural = "Provedores de IA"

class Agente(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome do Agente")
    provedor = models.ForeignKey(ProvedorIA, on_delete=models.SET_NULL, null=True, verbose_name="Provedor")
    system_prompt = models.TextField(verbose_name="System Prompt", help_text="Aja como... Seu objetivo é...")
    temperatura = models.FloatField(default=0.7, help_text="0.0 (Focado/Rígido) a 1.0 (Muito Criativo)")

    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Agente"
        verbose_name_plural = "Config: Agentes"