from django.urls import path
from .views import LoginView, UsuarioRegistroAPIView, verificar_correo, perfil_usuario_actual, UsuarioViewSet, registrar_usuario
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('registrar/', registrar_usuario, name='registrar_usuario'),
    path('verificar-correo/', verificar_correo, name='verificar_correo'),
    path('registro-drf/', UsuarioRegistroAPIView.as_view(), name='registro_drf'),
    path('usuarios/perfil/', perfil_usuario_actual, name='perfil_usuario_actual'),
    path('usuarios/me/', UsuarioViewSet.as_view({'get': 'me'}), name='usuario_me'),
]

# Incluye las rutas del router (ViewSet)
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
urlpatterns += router.urls
