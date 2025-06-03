from django.urls import path
from .views import (
    LoginView, UsuarioRegistroAPIView, verificar_correo, 
    perfil_usuario_actual, UsuarioViewSet, registrar_usuario, 
    cambiar_nombre_usuario, eliminar_cuenta, get_csrf, 
    sincronizar_contrasena_supabase, contactar_usuario
)
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('get_csrf/', get_csrf, name='get_csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('registrar/', registrar_usuario, name='registrar_usuario'),
    path('verificar-correo/', verificar_correo, name='verificar_correo'),
    path('registro-drf/', UsuarioRegistroAPIView.as_view(), name='registro_drf'),
    path('usuarios/perfil/', perfil_usuario_actual, name='perfil_usuario_actual'),
    path('usuarios/me/', UsuarioViewSet.as_view({'get': 'me', 'patch': 'me'}), name='usuario_me'),
    path('usuarios/cambiar_contrasena/', UsuarioViewSet.as_view({'post': 'cambiar_contrasena'}), name='cambiar_contrasena'),    path('usuarios/cambiar_nombre_usuario/', cambiar_nombre_usuario, name='cambiar_nombre_usuario'),
    path('usuarios/eliminar_cuenta/', eliminar_cuenta, name='eliminar_cuenta'),
    path('sincronizar-contrasena-supabase/', sincronizar_contrasena_supabase, name='sincronizar_contrasena_supabase'),
    path('contactar-usuario/', contactar_usuario, name='contactar_usuario'),
]

# Incluye las rutas del router (ViewSet)
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
urlpatterns += router.urls
