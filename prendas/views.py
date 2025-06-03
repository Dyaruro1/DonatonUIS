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

# DIP imports - Dependency Inversion Principle
from backend_django.core.container import get_container, Container
from backend_django.core.interfaces import (
    IPrendaRepository,
    IImageService,
    IDomainValidator
)

# Create your views here.

class PrendaViewSet(viewsets.ModelViewSet):
    """ViewSet de prendas refactorizado siguiendo el principio DIP"""
    queryset = Prenda.objects.all()
    serializer_class = PrendaSerializer
    permission_classes = [IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Inyección de dependencias
        container = get_container()
        self._prenda_repository: IPrendaRepository = container.get(IPrendaRepository)
        self._image_service: IImageService = container.get(IImageService)
        self._domain_validator: IDomainValidator = container.get(IDomainValidator)

    def create(self, request, *args, **kwargs):
        """Creación de prenda usando inyección de dependencias"""
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Usuario no autenticado'}, status=401)
        
        data = request.data.copy()
        imagenes = request.FILES.getlist('imagenes')
        
        # Validar cantidad de imágenes usando el repositorio
        if len(imagenes) > 3:
            return Response({'error': 'Máximo 3 imágenes permitidas.'}, status=400)
        
        # Preparar datos de la prenda
        prenda_data = {
            'nombre': data['nombre'],
            'talla': data['talla'],
            'sexo': data['sexo'],
            'uso': data.get('uso', ''),
            'descripcion': data.get('descripcion', ''),
            'donante': request.user,
            'status': 'disponible',
            'upload_status': 'En espera',
            'foto1': request.FILES.get('foto1'),
            'foto2': request.FILES.get('foto2'),
            'foto3': request.FILES.get('foto3'),
        }
          # Crear prenda usando el repositorio
        try:
            prenda = self._prenda_repository.create_prenda(prenda_data)
            return Response(PrendaSerializer(prenda, context={'request': request}).data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['get'], url_path='admin-list', permission_classes=[AllowAny])
    def admin_list(self, request):
        """Lista de admin usando inyección de dependencias"""
        # Usar el repositorio para obtener prendas en espera
        prendas = self._prenda_repository.get_prendas_by_status('En espera')
        serializer = PrendaAdminSerializer(prendas, many=True, context={'request': request})
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """Actualización de prenda usando inyección de dependencias"""
        instance = self.get_object()
        data = request.data.copy()
        fotos_existentes = data.getlist('fotos_existentes') if 'fotos_existentes' in data else []
        nuevas_imagenes = request.FILES.getlist('imagenes')
        
        # Manejar imágenes usando el servicio de imágenes
        try:
            # Eliminar imágenes que el usuario quitó usando el servicio
            self._image_service.cleanup_removed_images(instance, fotos_existentes)
            
            # Validar cantidad máxima de imágenes
            total_imgs = instance.imagenes.count() + len(nuevas_imagenes)
            if total_imgs > 3:
                return Response({'error': 'Máximo 3 imágenes permitidas.'}, status=400)
            
            # Procesar nuevas imágenes usando el servicio
            if nuevas_imagenes:
                self._image_service.update_prenda_images(instance, nuevas_imagenes)
            
            # Preparar datos de actualización
            update_data = {
                'nombre': data.get('nombre', instance.nombre),
                'talla': data.get('talla', instance.talla),
                'sexo': data.get('sexo', instance.sexo),
                'uso': data.get('uso', instance.uso),
                'descripcion': data.get('descripcion', instance.descripcion),
            }
            
            # Solo el dueño puede editar el status
            if 'status' in data and hasattr(request, 'user') and instance.donante == request.user:
                if data['status'] in dict(Prenda.STATUS_CHOICES):
                    update_data['status'] = data['status']
            
            # Permitir actualizar upload_status desde el PATCH
            if 'upload_status' in data:
                if data['upload_status'] in dict(Prenda.UPLOAD_STATUS_CHOICES):
                    update_data['upload_status'] = data['upload_status']
              # Actualizar usando el repositorio
            updated_prenda = self._prenda_repository.update_prenda(instance, update_data)
            serializer = self.get_serializer(updated_prenda, context={'request': request})
            return Response(serializer.data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'], url_path='incrementar-visitas', permission_classes=[AllowAny])
    def incrementar_visitas(self, request, pk=None):
        """Incrementar visitas usando inyección de dependencias"""
        prenda = self.get_object()
        user = request.user if request.user.is_authenticated else None
        
        # Solo suma si el usuario no es el donante
        if user is None or prenda.donante != user:
            success = self._prenda_repository.increment_visits(prenda.id)
            if success:
                prenda.refresh_from_db()  # Refrescar para obtener el valor actualizado
                return Response({'visitas': prenda.visitas})
            else:
                return Response({'error': 'Error al incrementar visitas'}, status=500)
        
        return Response({'visitas': prenda.visitas, 'msg': 'No se suma visita para el donante.'})

    def get_permissions(self):
        # Permitir acceso público al detalle de prenda (retrieve)
        if self.action == 'retrieve':
            return [AllowAny()]
        return super().get_permissions()
    
    def list(self, request, *args, **kwargs):
        """Lista de prendas usando inyección de dependencias"""
        # Solo mostrar prendas con upload_status='Cargado' usando el repositorio
        queryset = self._prenda_repository.get_prendas_by_status('Cargado')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

@csrf_exempt
def get_prenda_name(request, prenda_id):
    """Obtener nombre de prenda usando inyección de dependencias"""
    # Inyección de dependencias
    container = get_container()
    prenda_repository: IPrendaRepository = container.get(IPrendaRepository)
    
    try:
        prenda = prenda_repository.get_prenda_by_id(prenda_id)
        if prenda:
            return JsonResponse({"id": prenda.id, "nombre": prenda.nombre})
        else:
            return JsonResponse({"error": "Prenda no encontrada"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
