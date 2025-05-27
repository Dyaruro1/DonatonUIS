from django.shortcuts import render
from rest_framework import viewsets
from .models import Prenda
from .serializers import PrendaSerializer

# Create your views here.

class PrendaViewSet(viewsets.ModelViewSet):
    queryset = Prenda.objects.all()
    serializer_class = PrendaSerializer
