from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from usuarios.views import UsuarioViewSet, LoginView, UsuarioRegistroAPIView
from prendas.views import PrendaViewSet
from donaciones.views import DonacionViewSet
from solicitudes.views import SolicitudViewSet
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.urls import re_path

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

# Catch-all para SPA React: sirve index.html en cualquier ruta que no sea API ni admin
urlpatterns += [
    re_path(r'^(?!api/|admin/).*$', TemplateView.as_view(template_name="index.html")),
]