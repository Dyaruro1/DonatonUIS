from django.urls import path
from .views import LoginView, UsuarioRegistroAPIView, verificar_correo

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('registrar/', UsuarioRegistroAPIView.as_view(), name='registrar'),
    path('verificar-correo/', verificar_correo, name='verificar-correo'),
]
