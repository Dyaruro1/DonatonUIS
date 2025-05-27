from django.urls import path
from .views import LoginView, UsuarioRegistroAPIView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('registrar/', UsuarioRegistroAPIView.as_view(), name='registrar'),
]
