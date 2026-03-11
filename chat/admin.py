from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.utils.safestring import mark_safe
from .models import Acesso, Sessao, Mensagem, Agente, ProvedorIA

# --- Estilização do Painel ---
admin.site.site_header = "AIWA | Centro de Comando"
admin.site.site_title = "AIWA Admin"
admin.site.index_title = "Gestão de Inteligência Artificial"

# --- Base para Relatórios (Apenas Leitura) ---
class ReadOnlyAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False
    def has_delete_permission(self, request, obj=None):
        return False
    def has_change_permission(self, request, obj=None):
        return False

# --- CUSTOMIZAÇÃO DE USUÁRIOS ---
# 1. Primeiro desregistramos o padrão para evitar o erro AlreadyRegistered
admin.site.unregister(User)

# 2. Registramos a sua versão customizada
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informações Pessoais', {'fields': ('email', 'first_name', 'last_name')}),
        ('Permissões e Grupos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups'),
        }),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj:
            form.base_fields['password'].help_text = mark_safe("""
                <style>
                    .field-password p { font-size: 0 !important; color: transparent !important; } 
                    .field-password p bdi, .field-password p strong { display: none !important; }
                    .field-password p a { 
                        font-size: 0.8125rem !important; 
                        display: inline-block !important; 
                        visibility: visible !important;
                        color: #fff !important;
                        background-color: #417690;
                        padding: 10px 15px;
                        border-radius: 4px;
                        text-decoration: none;
                    }
                </style>
                O algoritmo de segurança está oculto.
            """)
        return form

# --- RELATÓRIOS ---
@admin.register(Acesso)
class AcessoAdmin(ReadOnlyAdmin):
    list_display = ('ip', 'data_hora')
    list_filter = ('data_hora',)

@admin.register(Sessao)
class SessaoAdmin(ReadOnlyAdmin):
    list_display = ('protocolo', 'criado_em')

@admin.register(Mensagem)
class MensagemAdmin(ReadOnlyAdmin):
    list_display = ('sessao', 'remetente', 'texto_curto')
    
    def texto_curto(self, obj):
        return obj.texto[:50] + "..."
    texto_curto.short_description = "Conteúdo"

# --- CONFIGURAÇÕES DE IA ---
@admin.register(Agente)
class AgenteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'temperatura')

@admin.register(ProvedorIA)
class ProvedorAdmin(admin.ModelAdmin):
    list_display = ('nome', 'modelo')