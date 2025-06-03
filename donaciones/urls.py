from django.urls import path
from . import views

urlpatterns = [
    path('denunciar-prenda/', views.denunciar_prenda, name='denunciar_prenda'),
    path('soporte/', views.soporte_registro, name='soporte_registro'),
]
