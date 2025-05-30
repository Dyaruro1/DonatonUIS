from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Prenda, ImagenPrenda
from .serializers import PrendaSerializer, PrendaAdminSerializer, ImagenPrendaSerializer
import os

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
        # Forzar status a 'disponible' y upload_status a 'En espera' siempre
        prenda = Prenda.objects.create(
            nombre=data['nombre'],
            talla=data['talla'],
            sexo=data['sexo'],
            uso=data.get('uso', ''),
            descripcion=data.get('descripcion', ''),
            donante=request.user,
            status='disponible',
            upload_status='En espera'
        )
        for img in imagenes:
            ImagenPrenda.objects.create(prenda=prenda, imagen=img)
        return Response(PrendaSerializer(prenda, context={'request': request}).data)

    @action(detail=False, methods=['get'], url_path='admin-list', permission_classes=[AllowAny])
    def admin_list(self, request):
        # Solo prendas con upload_status 'En espera'
        prendas = Prenda.objects.filter(upload_status='En espera')
        serializer = PrendaAdminSerializer(prendas, many=True, context={'request': request})
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()
        fotos_existentes = data.getlist('fotos_existentes') if 'fotos_existentes' in data else []
        nuevas_imagenes = request.FILES.getlist('imagenes')

        # Eliminar imágenes que el usuario quitó
        actuales = list(instance.imagenes.all())
        for img in actuales:
            nombre_archivo = os.path.basename(img.imagen.name)
            if nombre_archivo not in fotos_existentes:
                img.delete()

        # Validar que no se exceda el máximo de 3 imágenes
        total_imgs = instance.imagenes.count() + len(nuevas_imagenes)
        if total_imgs > 3:
            return Response({'error': 'Máximo 3 imágenes permitidas.'}, status=400)

        # Agregar nuevas imágenes
        for img in nuevas_imagenes:
            ImagenPrenda.objects.create(prenda=instance, imagen=img)

        # Actualizar los demás campos
        instance.nombre = data.get('nombre', instance.nombre)
        instance.talla = data.get('talla', instance.talla)
        instance.sexo = data.get('sexo', instance.sexo)
        instance.uso = data.get('uso', instance.uso)
        instance.descripcion = data.get('descripcion', instance.descripcion)
        # Solo el dueño puede editar el status
        if 'status' in data and hasattr(request, 'user') and instance.donante == request.user:
            if data['status'] in dict(Prenda.STATUS_CHOICES):
                instance.status = data['status']
        instance.save()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    def get_permissions(self):
        # Permitir acceso público al detalle de prenda (retrieve)
        if self.action == 'retrieve':
            return [AllowAny()]
        return super().get_permissions()
