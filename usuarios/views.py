from django.shortcuts import render
from rest_framework import viewsets
from .models import Usuario
from .serializers import UsuarioSerializer
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class LoginView(APIView):
    def post(self, request):
        correo = request.data.get('username') or request.data.get('correo')
        password = request.data.get('password')
        if not correo or not password:
            return Response({'detail': 'Correo y contraseña requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=correo, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'usuario': correo})
        else:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def registrar_usuario(request):
    data = request.data
    try:
        usuario = Usuario.objects.create_user(
            username=data.get('nombre_usuario'),
            password=data.get('contrasena'),
            email=data.get('correo'),
            first_name=data.get('nombre'),
            last_name=data.get('apellido'),
            sexo=data.get('sexo'),
            fecha_nacimiento=data.get('fecha_nacimiento'),
            telefono=data.get('telefono'),
            universidad=data.get('universidad', ''),
            facultad=data.get('facultad', ''),
            programa=data.get('programa', ''),
            tipo_usuario=data.get('tipo_usuario', ''),
            direccion=data.get('direccion', ''),
            foto=request.FILES.get('foto')  # Changed from foto_url to foto and using request.FILES
        )
        return Response({'detail': 'Usuario registrado correctamente.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
