from django.contrib import admin
from .models import Acesso, Sessao, Mensagem, ProvedorIA, Agente

@admin.register(Acesso)
class AcessoAdmin(admin.ModelAdmin):
    list_display = ('ip', 'data_hora', 'user_agent')
    search_fields = ('ip',)
    readonly_fields = ('data_hora',)

# 1. Cria a visualização agrupada das mensagens (O poder oculto!)
class MensagemInline(admin.TabularInline):
    model = Mensagem
    extra = 0  # Não mostra linhas em branco
    readonly_fields = ('remetente', 'texto', 'enviado_em') # Bloqueia edição para manter o log fiel
    can_delete = False
    ordering = ('enviado_em',)

# 2. Acopla as mensagens dentro da página da Sessão
@admin.register(Sessao)
class SessaoAdmin(admin.ModelAdmin):
    list_display = ('protocolo', 'criado_em', 'consentimento_lgpd')
    search_fields = ('protocolo',)
    list_filter = ('consentimento_lgpd', 'criado_em')
    inlines = [MensagemInline] # <-- A mágica acontece aqui

# 3. Mantém a tabela de mensagens separada caso queira buscar por um texto específico
@admin.register(Mensagem)
class MensagemAdmin(admin.ModelAdmin):
    list_display = ('sessao', 'remetente', 'resumo_texto', 'enviado_em')
    search_fields = ('texto', 'sessao__protocolo')
    list_filter = ('remetente', 'enviado_em')

    def resumo_texto(self, obj):
        return obj.texto[:50] + '...' if len(obj.texto) > 50 else obj.texto
    resumo_texto.short_description = 'Mensagem'

@admin.register(ProvedorIA)
class ProvedorIAAdmin(admin.ModelAdmin):
    list_display = ('nome', 'modelo')

@admin.register(Agente)
class AgenteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'provedor', 'temperatura')