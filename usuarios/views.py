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
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.views import ObtainAuthToken

# Create your views here.

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

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
            return Response({'token': token.key, 'usuario': usuario_obj.username})
        else:
            return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])  # Permitir acceso sin autenticación
def registrar_usuario(request):
    print('Headers:', request.headers)  # Depuración de encabezados
    print('Data:', request.data)  # Depuración de datos
    # Permitir acceso sin autenticación
    request._auth = None
    data = request.data.copy()
    # Normalizar correo antes de cualquier validación
    if 'correo' in data and data['correo']:
        data['correo'] = data['correo'].strip().lower()
    try:
        # Validar si el correo ya existe
        if Usuario.objects.filter(correo=data.get('correo')).exists():
            return Response({'detail': 'Ya existe una cuenta registrada con ese correo.'}, status=status.HTTP_400_BAD_REQUEST)
        # Validar si el nombre de usuario ya existe
        if Usuario.objects.filter(username=data.get('nombre_usuario')).exists():
            return Response({'detail': 'Ya existe una cuenta registrada con ese nombre de usuario.'}, status=status.HTTP_400_BAD_REQUEST)
        usuario = Usuario.objects.create_user(
            username=data.get('nombre_usuario'),
            password=data.get('contrasena'),
            email=data.get('correo'),
            first_name=data.get('nombre'),
            last_name=data.get('apellido'),
            sexo=data.get('sexo'),
            fecha_nacimiento=data.get('fecha_nacimiento'),
            telefono=data.get('telefono'),
            foto=request.FILES.get('foto')
        )
        return Response({'detail': 'Usuario registrado correctamente.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        # Clean request data for JSON serialization (remove file objects, show only file names)
        from django.http import QueryDict
        def clean_data(data):
            cleaned = {}
            for k, v in data.items():
                # Handle MultiValueDict (lists of files)
                if hasattr(v, 'name'):
                    cleaned[k] = v.name
                elif isinstance(v, list):
                    cleaned[k] = [item.name if hasattr(item, 'name') else str(item) for item in v]
                else:
                    try:
                        str(v)
                        cleaned[k] = v
                    except Exception:
                        cleaned[k] = '<non-serializable>'
            return cleaned
        safe_data = clean_data(request.data)
        safe_files = clean_data(request.FILES)
        return Response({
            'detail': str(e),
            'data': safe_data,
            'files': safe_files
        }, status=status.HTTP_400_BAD_REQUEST)

class UsuarioRegistroAPIView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    permission_classes = [AllowAny]
