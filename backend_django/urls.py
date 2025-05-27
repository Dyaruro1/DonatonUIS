from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from usuarios.views import UsuarioViewSet, LoginView, UsuarioRegistroAPIView
from prendas.views import PrendaViewSet
from donaciones.views import DonacionViewSet
from solicitudes.views import SolicitudViewSet
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'prendas', PrendaViewSet)
router.register(r'donaciones', DonacionViewSet)
router.register(r'solicitudes', SolicitudViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('usuarios.urls')),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)