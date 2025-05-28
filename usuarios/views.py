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
from django.contrib.auth.hashers import check_password
from django.core.mail import EmailMessage
import random
import requests
import msal

# Configuración de Microsoft Graph (rellena con tus datos reales)
MS_CLIENT_ID = 'TU_CLIENT_ID'
MS_CLIENT_SECRET = 'TU_CLIENT_SECRET'
MS_TENANT_ID = 'TU_TENANT_ID'
MS_SENDER = 'julio2220089@correo.uis.edu.co'  # El correo desde el que se enviará
MS_AUTHORITY = f'https://login.microsoftonline.com/{MS_TENANT_ID}'
MS_SCOPE = ['https://graph.microsoft.com/.default']

def enviar_correo_microsoft(destinatario, asunto, mensaje):
    app = msal.ConfidentialClientApplication(
        MS_CLIENT_ID,
        authority=MS_AUTHORITY,
        client_credential=MS_CLIENT_SECRET
    )
    result = app.acquire_token_for_client(scopes=MS_SCOPE)
    if 'access_token' not in result:
        raise Exception('No se pudo obtener el token de Microsoft Graph')
    access_token = result['access_token']
    url = f'https://graph.microsoft.com/v1.0/users/{MS_SENDER}/sendMail'
    email_msg = {
        "message": {
            "subject": asunto,
            "body": {
                "contentType": "Text",
                "content": mensaje
            },
            "toRecipients": [
                {"emailAddress": {"address": destinatario}}
            ]
        }
    }
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    response = requests.post(url, headers=headers, json=email_msg)
    if not response.ok:
        raise Exception(f'Error enviando correo: {response.text}')

# Create your views here.

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
        serializer.save()
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
    user.delete()
    return Response({'detail': 'Cuenta eliminada correctamente.'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def restablecer_contrasena(request):
    correo = request.data.get('correo', '').strip().lower()
    if not correo:
        return Response({'detail': 'Debes proporcionar un correo.'}, status=status.HTTP_400_BAD_REQUEST)
    usuario = Usuario.objects.filter(correo=correo).first()
    if not usuario:
        return Response({'detail': 'No existe una cuenta con ese correo.'}, status=status.HTTP_404_NOT_FOUND)
    # Generar nueva contraseña aleatoria de 3 dígitos
    nueva_contrasena = str(random.randint(100, 999))
    usuario.set_password(nueva_contrasena)
    usuario.save()
    # Enviar correo con la nueva contraseña usando Microsoft Graph
    subject = 'Restablecimiento de contraseña - Donaton UIS'
    message = f'Su nueva contraseña temporal es: {nueva_contrasena}'
    enviar_correo_microsoft(correo, subject, message)
    return Response({'detail': 'Se ha enviado un correo con la nueva contraseña.'}, status=status.HTTP_200_OK)
