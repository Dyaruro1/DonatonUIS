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
from backend_django.supabase_settings import SUPABASE_URL, SUPABASE_KEY
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

# Create your views here.

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
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
        user = request.user
        contrasena_anterior = request.data.get('contrasena_anterior')
        contrasena_nueva = request.data.get('contrasena_nueva')
        if not contrasena_anterior or not contrasena_nueva:
            return Response({'detail': 'Debes ingresar la contraseña anterior y la nueva.'}, status=status.HTTP_400_BAD_REQUEST)
        if not check_password(contrasena_anterior, user.password):
            return Response({'detail': 'La contraseña anterior es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(contrasena_nueva)
        user.save()
        return Response({'detail': 'Contraseña cambiada exitosamente.'})

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print('Login payload:', request.data)
        correo = request.data.get('correo')
        password = request.data.get('password')
        print('Correo recibido:', correo)
        usuario_obj = Usuario.objects.filter(correo=correo.strip().lower()).first() if correo else None
        print('Usuario encontrado:', usuario_obj)
        if usuario_obj:
            print('Usuario activo:', usuario_obj.is_active)
            print('Username usado para authenticate:', usuario_obj.username)
        if not correo or not password:
            return Response({'detail': 'Correo y contraseña requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        if not usuario_obj:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_400_BAD_REQUEST)
        if not usuario_obj.is_active:
            return Response({'detail': 'La cuenta está inactiva. Contacta al administrador.'}, status=status.HTTP_403_FORBIDDEN)
        user = authenticate(request, username=usuario_obj.username, password=password)
        print('Resultado authenticate:', user)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            # Devuelve todos los datos del usuario, no solo el username
            serializer = UsuarioSerializer(usuario_obj)
            return Response({'token': token.key, 'usuario': serializer.data})
        else:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])  # Permitir acceso sin autenticación
def registrar_usuario(request):
    print('Headers:', request.headers)  # Depuración de encabezados
    print('Data:', request.data)  # Depuración de datos
    request._auth = None
    data = request.data.copy()
    if 'correo' in data and data['correo']:
        data['correo'] = data['correo'].strip().lower()
    serializer = UsuarioSerializer(data=data)
    if serializer.is_valid():
        usuario = serializer.save()
        # --- INICIO: Registro en Supabase Auth ---
        from backend_django.supabase_settings import SUPABASE_URL, SUPABASE_KEY
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        correo = usuario.correo
        password = request.data.get('contrasena')
        try:
            if password and password != 'MICROSOFT_AUTH':
                response = supabase.auth.admin.create_user({
                    'email': correo,
                    'password': password,
                    'email_confirm': True
                })
                # Manejo explícito de error y depuración
                print('Respuesta Supabase create_user:', response)
                if hasattr(response, 'user') and response.user is not None:
                    print('Usuario creado en Supabase:', response.user)
                elif hasattr(response, 'error') and response.error is not None:
                    print('Error creando usuario en Supabase:', response.error)
                else:
                    print('Respuesta inesperada de Supabase:', response)
        except Exception as e:
            print('Excepción al crear usuario en Supabase:', str(e))
        # --- FIN: Registro en Supabase Auth ---
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
    correo = request.GET.get('correo', '').strip().lower()
    exists = Usuario.objects.filter(correo=correo).exists()
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
    user = request.user
    nuevo_username = request.data.get('nombre_usuario')
    if not nuevo_username:
        return Response({'detail': 'Debes proporcionar un nombre de usuario.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(nuevo_username) < 2:
        return Response({'detail': 'El nombre de usuario debe tener al menos 2 caracteres.'}, status=status.HTTP_400_BAD_REQUEST)
    if Usuario.objects.filter(username=nuevo_username).exclude(pk=user.pk).exists():
        return Response({'detail': 'Este nombre de usuario ya está en uso.'}, status=status.HTTP_400_BAD_REQUEST)
    user.username = nuevo_username
    user.save()
    return Response({'detail': 'Nombre de usuario actualizado correctamente.'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_cuenta(request):
    user = request.user
    # --- INICIO: Eliminación en Supabase Auth ---
    from backend_django.supabase_settings import SUPABASE_URL, SUPABASE_KEY
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    try:
        # Buscar usuario en Supabase por email
        email = user.correo
        # Listar usuarios para encontrar el id
        users = supabase.auth.admin.list_users(email=email)
        if users and users.get('users'):
            for u in users['users']:
                if u.get('email') == email:
                    supabase.auth.admin.delete_user(u['id'])
                    break
    except Exception as e:
        print('Excepción al eliminar usuario en Supabase:', str(e))
    # --- FIN: Eliminación en Supabase Auth ---
    user.delete()
    return Response({'detail': 'Cuenta eliminada correctamente.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def sincronizar_contrasena_supabase(request):
    correo = request.data.get('correo')
    nueva_contrasena = request.data.get('nueva_contrasena')
    if not correo or not nueva_contrasena:
        return Response({'detail': 'Correo y nueva contraseña son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        usuario = Usuario.objects.get(correo__iexact=correo)
        usuario.set_password(nueva_contrasena)
        usuario.save()
        return Response({'detail': 'Contraseña sincronizada exitosamente en el backend.'}, status=status.HTTP_200_OK)
    except Usuario.DoesNotExist:
        return Response({'detail': 'Usuario no encontrado en el backend.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error sincronizando contraseña: {str(e)}")
        return Response({'detail': 'Error interno al sincronizar la contraseña.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def contactar_usuario(request):
    """
    Endpoint para que los administradores contacten usuarios por correo.
    Requiere: usuarioDestinoId, mensaje, tipo (opcional)
    """
    # Verificar permisos: is_staff, is_superuser, o tipoUsuario='admin'
    if not (request.user.is_staff or request.user.is_superuser or getattr(request.user, 'tipoUsuario', None) == 'admin'):
        return Response({'detail': 'No tienes permisos para contactar usuarios.'}, status=status.HTTP_403_FORBIDDEN)
    
    usuario_destino_id = request.data.get('usuarioDestinoId')
    mensaje = request.data.get('mensaje')
    tipo = request.data.get('tipo', 'contacto_admin')
    
    # Validaciones básicas
    if not usuario_destino_id or not mensaje:
        return Response({'error': 'Usuario destinatario y mensaje son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Obtener usuario destinatario
        usuario_destino = Usuario.objects.get(id=usuario_destino_id)
        
        # Obtener información del administrador remitente
        admin_remitente = request.user
        nombre_admin = f"{admin_remitente.nombre} {admin_remitente.apellido}".strip() or admin_remitente.username
        correo_admin = admin_remitente.correo
          # Crear el mensaje de correo
        asunto = f"Mensaje del equipo de DonatonUIS"
        
        mensaje_correo = f"""
Hola {usuario_destino.nombre} {usuario_destino.apellido},

Has recibido un mensaje del equipo administrativo de DonatonUIS:

{mensaje}

---
Este mensaje fue enviado por: {nombre_admin}
Email de contacto: {correo_admin}

Para responder a este mensaje, simplemente responde a este correo y tu respuesta llegará directamente a {nombre_admin}.

Saludos,
Equipo DonatonUIS
"""# Enviar el correo
        from django.core.mail import EmailMessage
        
        # Crear email con Reply-To personalizado
        email = EmailMessage(
            subject=asunto,
            body=mensaje_correo,
            from_email='daniel2220088@correo.uis.edu.co',  # Email del sistema (configurado)
            to=[usuario_destino.correo],
            reply_to=[correo_admin],  # Cuando el usuario responda, irá al admin
        )
        email.send(fail_silently=False)
        
        return Response({
            'success': True, 
            'message': f'Correo enviado exitosamente a {usuario_destino.nombre} {usuario_destino.apellido}'
        }, status=status.HTTP_200_OK)
        
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario destinatario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f'Error enviando correo de contacto: {e}')
        return Response({'error': 'Error al enviar el correo. Intenta de nuevo.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
