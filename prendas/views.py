from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Prenda, ImagenPrenda
from .serializers import PrendaSerializer, PrendaAdminSerializer, ImagenPrendaSerializer
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

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
        foto1 = request.FILES.get('foto1')
        foto2 = request.FILES.get('foto2')
        foto3 = request.FILES.get('foto3')
        # Forzar status a 'disponible' y upload_status a 'En espera' siempre
        prenda = Prenda.objects.create(
            nombre=data['nombre'],
            talla=data['talla'],
            sexo=data['sexo'],
            uso=data.get('uso', ''),
            descripcion=data.get('descripcion', ''),
            donante=request.user,
            status='disponible',
            upload_status='En espera',
            foto1=foto1,
            foto2=foto2,
            foto3=foto3,
        )
        prenda.refresh_from_db()
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
        # Si hay nuevas imágenes, actualizar la foto principal y las secundarias
        if nuevas_imagenes:
            # Actualizar foto principal
            instance.foto = nuevas_imagenes[0]
            instance.save()
            # Eliminar todas las ImagenPrenda y volver a crear con las nuevas (menos la principal)
            instance.imagenes.all().delete()
            for img in nuevas_imagenes[1:]:
                ImagenPrenda.objects.create(prenda=instance, imagen=img)
        # Actualizar hasta tres imágenes en los campos foto1, foto2 y foto3
        if nuevas_imagenes:
            if len(nuevas_imagenes) > 0:
                instance.foto1 = nuevas_imagenes[0]
            if len(nuevas_imagenes) > 1:
                instance.foto2 = nuevas_imagenes[1]
            if len(nuevas_imagenes) > 2:
                instance.foto3 = nuevas_imagenes[2]
            instance.save()
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
        # Permitir actualizar upload_status desde el PATCH
        if 'upload_status' in data:
            if data['upload_status'] in dict(Prenda.UPLOAD_STATUS_CHOICES):
                instance.upload_status = data['upload_status']
        instance.save()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='incrementar-visitas', permission_classes=[AllowAny])
    def incrementar_visitas(self, request, pk=None):
        prenda = self.get_object()
        user = request.user if request.user.is_authenticated else None
        # Solo suma si el usuario no es el donante
        if user is None or prenda.donante != user:
            prenda.visitas += 1
            prenda.save(update_fields=['visitas'])
            return Response({'visitas': prenda.visitas})
        return Response({'visitas': prenda.visitas, 'msg': 'No se suma visita para el donante.'})

    def get_permissions(self):
        # Permitir acceso público al detalle de prenda (retrieve)
        if self.action == 'retrieve':
            return [AllowAny()]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        # Solo mostrar prendas con upload_status='Cargado' en el endpoint principal
        queryset = Prenda.objects.filter(upload_status='Cargado')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

@csrf_exempt
def get_prenda_name(request, prenda_id):
    try:
        prenda = Prenda.objects.get(id=prenda_id)
        return JsonResponse({"id": prenda.id, "nombre": prenda.nombre})
    except Prenda.DoesNotExist:
        return JsonResponse({"error": "Prenda no encontrada"}, status=404)
