from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Prenda, ImagenPrenda
from .serializers import PrendaSerializer, PrendaAdminSerializer, ImagenPrendaSerializer

# Create your views here.

class PrendaViewSet(viewsets.ModelViewSet):
    queryset = Prenda.objects.all()
    serializer_class = PrendaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Usuario no autenticado'}, status=401)
        data = request.data.copy()
        imagenes = request.FILES.getlist('imagenes')
        if len(imagenes) > 3:
            return Response({'error': 'Máximo 3 imágenes permitidas.'}, status=400)
        # Crear la prenda asignando el usuario autenticado como donante
        prenda = Prenda.objects.create(
            nombre=data['nombre'],
            talla=data['talla'],
            sexo=data['sexo'],
            uso=data.get('uso', ''),
            descripcion=data.get('descripcion', ''),
            donante=request.user
        )
        for img in imagenes:
            ImagenPrenda.objects.create(prenda=prenda, imagen=img)
        return Response(PrendaSerializer(prenda, context={'request': request}).data)

    @action(detail=False, methods=['get'], url_path='admin-list')
    def admin_list(self, request):
        prendas = Prenda.objects.all()
        serializer = PrendaAdminSerializer(prendas, many=True, context={'request': request})
        return Response(serializer.data)
