from django.shortcuts import render
from rest_framework import viewsets
from .models import Solicitud
from .serializers import SolicitudSerializer

# Create your views here.

class SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer
