from django.shortcuts import render
from rest_framework import viewsets, generics
from .models import Usuario
from .serializers import UsuarioSerializer
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import action
from django.contrib.auth.hashers import check_password, make_password
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
import requests
import random
from supabase import create_client, Client
import os
from django.conf import settings

# DIP imports - Dependency Inversion Principle
from backend_django.core.container import get_container, Container
from backend_django.core.interfaces import (
    IUserRepository, 
    IAuthenticationService, 
    IExternalAuthProvider,
    IDomainValidator
)

# Create your views here.

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet refactorizado siguiendo el principio DIP"""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Inyección de dependencias
        container = get_container()
        self._user_repository: IUserRepository = container.get(IUserRepository)
        self._auth_service: IAuthenticationService = container.get(IAuthenticationService)
        self._domain_validator: IDomainValidator = container.get(IDomainValidator)

    # Permitir que el usuario autenticado edite su propio perfil
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'retrieve']:
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_object(self):
        # Si la acción es 'me', devolver el usuario autenticado
        if self.action == 'me':
            return self.request.user
        return super().get_object()

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def cambiar_contrasena(self, request):
        """Cambio de contraseña usando inyección de dependencias"""
        user = request.user
        contrasena_anterior = request.data.get('contrasena_anterior')
        contrasena_nueva = request.data.get('contrasena_nueva')
        
        if not contrasena_anterior or not contrasena_nueva:
            return Response({'detail': 'Debes ingresar la contraseña anterior y la nueva.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Usar el servicio de autenticación inyectado
        if not self._auth_service.verify_password(user, contrasena_anterior):
            return Response({'detail': 'La contraseña anterior es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar nueva contraseña usando el validador de dominio
        if not self._domain_validator.validate_password(contrasena_nueva):
            return Response({'detail': 'La nueva contraseña no cumple con los requisitos.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Actualizar contraseña usando el repositorio
        success = self._user_repository.update_password(user, contrasena_nueva)
        if success:
            return Response({'detail': 'Contraseña cambiada exitosamente.'})
        else:
            return Response({'detail': 'Error al cambiar la contraseña.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    """Vista de login refactorizada siguiendo el principio DIP"""
    permission_classes = [AllowAny]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Inyección de dependencias
        container = get_container()
        self._user_repository: IUserRepository = container.get(IUserRepository)
        self._auth_service: IAuthenticationService = container.get(IAuthenticationService)
        self._domain_validator: IDomainValidator = container.get(IDomainValidator)
    
    def post(self, request):
        print('Login payload:', request.data)
        correo = request.data.get('correo')
        password = request.data.get('password')
        
        if not correo or not password:
            return Response({'detail': 'Correo y contraseña requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar formato de email usando el validador de dominio
        if not self._domain_validator.validate_email(correo):
            return Response({'detail': 'Formato de correo inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar usuario usando el repositorio
        usuario_obj = self._user_repository.get_by_email(correo.strip().lower())
        print('Usuario encontrado:', usuario_obj)
        
        if not usuario_obj:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not usuario_obj.is_active:
            return Response({'detail': 'La cuenta está inactiva. Contacta al administrador.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Autenticar usando el servicio de autenticación
        user = self._auth_service.authenticate_user(usuario_obj.username, password)
        print('Resultado authenticate:', user)
        
        if user is not None:
            token = self._auth_service.get_or_create_token(user)
            # Devuelve todos los datos del usuario, no solo el username
            serializer = UsuarioSerializer(usuario_obj)
            return Response({'token': token, 'usuario': serializer.data})
        else:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])  # Permitir acceso sin autenticación
def registrar_usuario(request):
    """Registro de usuario refactorizado siguiendo el principio DIP"""
    print('Headers:', request.headers)  # Depuración de encabezados
    print('Data:', request.data)  # Depuración de datos
    request._auth = None
      # Inyección de dependencias
    container = get_container()
    user_repository: IUserRepository = container.get(IUserRepository)
    external_auth: IExternalAuthProvider = container.get(IExternalAuthProvider)
    domain_validator: IDomainValidator = container.get(IDomainValidator)
    
    data = request.data.copy()
    if 'correo' in data and data['correo']:
        data['correo'] = data['correo'].strip().lower()
        
        # Validar formato de email usando el validador de dominio
        if not domain_validator.validate_email(data['correo']):
            return Response({'detail': 'Formato de correo inválido.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = UsuarioSerializer(data=data)
    if serializer.is_valid():
        usuario = serializer.save()
        
        # Registro en proveedor externo (Supabase) usando inyección de dependencias
        correo = usuario.correo
        password = request.data.get('contrasena')
        
        try:
            if password and password != 'MICROSOFT_AUTH':
                success = external_auth.create_user(correo, password)
                if success:
                    print('Usuario creado exitosamente en proveedor externo')
                else:
                    print('Error creando usuario en proveedor externo')
        except Exception as e:
            print('Excepción al crear usuario en proveedor externo:', str(e))
        
        return Response({'detail': 'Usuario registrado correctamente.'}, status=status.HTTP_201_CREATED)
    else:
        print('Errores de validación:', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsuarioRegistroAPIView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    permission_classes = [AllowAny]

@api_view(['GET'])
def verificar_correo(request):
    """Verificación de correo refactorizada siguiendo el principio DIP"""
    # Inyección de dependencias
    container = get_container()
    user_repository: IUserRepository = container.get(IUserRepository)
    domain_validator: IDomainValidator = container.get(IDomainValidator)
    
    correo = request.GET.get('correo', '').strip().lower()
    
    if not domain_validator.validate_email(correo):
        return Response({'exists': False, 'error': 'Formato de correo inválido'})
    
    exists = user_repository.email_exists(correo)
    return Response({'exists': exists})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_usuario_actual(request):
    user = request.user
    serializer = UsuarioSerializer(user)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cambiar_nombre_usuario(request):
    """Cambio de nombre de usuario refactorizado siguiendo el principio DIP"""
    # Inyección de dependencias
    container = get_container()
    user_repository: IUserRepository = container.get(IUserRepository)
    domain_validator: IDomainValidator = container.get(IDomainValidator)
    
    user = request.user
    nuevo_username = request.data.get('nombre_usuario')
    
    if not nuevo_username:
        return Response({'detail': 'Debes proporcionar un nombre de usuario.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not domain_validator.validate_username(nuevo_username):
        return Response({'detail': 'El nombre de usuario debe tener al menos 2 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if user_repository.username_exists(nuevo_username, exclude_user_id=user.pk):
        return Response({'detail': 'Este nombre de usuario ya está en uso.'}, status=status.HTTP_400_BAD_REQUEST)
    
    success = user_repository.update_username(user, nuevo_username)
    if success:
        return Response({'detail': 'Nombre de usuario actualizado correctamente.'})
    else:
        return Response({'detail': 'Error al actualizar el nombre de usuario.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_cuenta(request):
    """Eliminación de cuenta refactorizada siguiendo el principio DIP"""
    # Inyección de dependencias
    container = get_container()
    user_repository: IUserRepository = container.get(IUserRepository)
    external_auth: IExternalAuthProvider = container.get(IExternalAuthProvider)
    
    user = request.user
    
    try:
        # Eliminar usuario del proveedor externo usando inyección de dependencias
        success = external_auth.delete_user(user.correo)
        if success:
            print('Usuario eliminado exitosamente del proveedor externo')
        else:
            print('Error eliminando usuario del proveedor externo')
    except Exception as e:
        print('Excepción al eliminar usuario del proveedor externo:', str(e))
    
    # Eliminar usuario del repositorio local
    user_repository.delete_user(user)
    return Response({'detail': 'Cuenta eliminada correctamente.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def sincronizar_contrasena_supabase(request):    
    """Sincronización de contraseña refactorizada siguiendo el principio DIP"""
    # Inyección de dependencias
    container = get_container()
    user_repository: IUserRepository = container.get(IUserRepository)
    domain_validator: IDomainValidator = container.get(IDomainValidator)
    
    correo = request.data.get('correo')
    nueva_contrasena = request.data.get('nueva_contrasena')
    
    if not correo or not nueva_contrasena:
        return Response({'detail': 'Correo y nueva contraseña son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not domain_validator.validate_email(correo):
        return Response({'detail': 'Formato de correo inválido.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not domain_validator.validate_password(nueva_contrasena):
        return Response({'detail': 'La contraseña no cumple con los requisitos.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        usuario = user_repository.get_by_email(correo)
        if not usuario:
            return Response({'detail': 'Usuario no encontrado en el backend.'}, status=status.HTTP_404_NOT_FOUND)
        
        success = user_repository.update_password(usuario, nueva_contrasena)
        if success:
            return Response({'detail': 'Contraseña sincronizada exitosamente en el backend.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Error al sincronizar la contraseña.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        print(f"Error sincronizando contraseña: {str(e)}")
        return Response({'detail': 'Error interno al sincronizar la contraseña.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Fin del archivo - Las dependencias directas han sido refactorizadas usando DIP
