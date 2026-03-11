from django.contrib import admin
from .models import Acesso, Sessao, Mensagem, Agente, ProvedorIA

# Relatórios (Apenas leitura)
@admin.register(Acesso, Sessao, Mensagem) # <-- O registro acontece AQUI
class ReadOnlyAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

# Configurações (Pode editar)
@admin.register(Agente)
class AgenteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'temperatura')

@admin.register(ProvedorIA)
class ProvedorAdmin(admin.ModelAdmin):
    list_display = ('nome', 'modelo')

admin.site.site_header = "AIWA | Centro de Comando"
admin.site.site_title = "AIWA Admin"
admin.site.index_title = "Gestão de Inteligência Artificial"