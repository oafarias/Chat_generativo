from django.contrib import admin
from .models import Acesso, Sessao, Mensagem

@admin.register(Acesso)
class AcessoAdmin(admin.ModelAdmin):
    list_display = ('ip', 'data_hora', 'user_agent')
    search_fields = ('ip',)
    readonly_fields = ('data_hora',)

@admin.register(Sessao)
class SessaoAdmin(admin.ModelAdmin):
    list_display = ('protocolo', 'criado_em', 'consentimento_lgpd')
    search_fields = ('protocolo',)
    list_filter = ('consentimento_lgpd', 'criado_em')

@admin.register(Mensagem)
class MensagemAdmin(admin.ModelAdmin):
    # Exibe as mensagens amarradas ao protocolo
    list_display = ('sessao', 'remetente', 'resumo_texto', 'enviado_em')
    search_fields = ('texto', 'sessao__protocolo')
    list_filter = ('remetente', 'enviado_em')

    # Cria uma coluna com o texto resumido para não quebrar o layout
    def resumo_texto(self, obj):
        return obj.texto[:50] + '...' if len(obj.texto) > 50 else obj.texto
    resumo_texto.short_description = 'Mensagem'