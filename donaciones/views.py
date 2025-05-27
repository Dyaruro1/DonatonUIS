from django.shortcuts import render
from rest_framework import viewsets
from .models import Donacion
from .serializers import DonacionSerializer

# Create your views here.

class DonacionViewSet(viewsets.ModelViewSet):
    queryset = Donacion.objects.all()
    serializer_class = DonacionSerializer
