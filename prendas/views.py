from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Prenda
from .serializers import PrendaSerializer, PrendaAdminSerializer

# Create your views here.

class PrendaViewSet(viewsets.ModelViewSet):
    queryset = Prenda.objects.all()
    serializer_class = PrendaSerializer

    @action(detail=False, methods=['get'], url_path='admin-list')
    def admin_list(self, request):
        prendas = Prenda.objects.all()
        serializer = PrendaAdminSerializer(prendas, many=True, context={'request': request})
        return Response(serializer.data)
