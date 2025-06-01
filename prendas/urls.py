from django.urls import path
from .views import get_prenda_name

urlpatterns = [
    # ...existing routes...
    path('prendas/<int:prenda_id>/nombre/', get_prenda_name, name='get_prenda_name'),
]