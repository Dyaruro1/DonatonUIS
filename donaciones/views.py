from django.shortcuts import render
from rest_framework import viewsets
from .models import Donacion
from .serializers import DonacionSerializer
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

class DonacionViewSet(viewsets.ModelViewSet):
    queryset = Donacion.objects.all()
    serializer_class = DonacionSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def denunciar_prenda(request):
    prenda_id = request.data.get('prendaId')
    motivo = request.data.get('motivo')
    prenda_nombre = request.data.get('prendaNombre')
    prenda_talla = request.data.get('prendaTalla')
    prenda_sexo = request.data.get('prendaSexo')
    prenda_estado = request.data.get('prendaEstado')

    User = get_user_model()
    # Cambiado: usar 'correo' en vez de 'email' para obtener los correos correctos
    admin_emails = list(User.objects.filter(tipoUsuario='admin').values_list('correo', flat=True))

    if not admin_emails:
        return Response({'error': 'No hay administradores.'}, status=status.HTTP_400_BAD_REQUEST)

    # Buscar el nombre del donante
    from prendas.models import Prenda
    try:
        prenda_obj = Prenda.objects.select_related('donante').get(id=prenda_id)
        donante = prenda_obj.donante
        nombre_donante = f"{donante.nombre} {donante.apellido}" if donante else "(desconocido)"
    except Exception:
        nombre_donante = "(desconocido)"

    # print('DEBUG - Correos admin:', admin_emails)
    # print('DEBUG - Mensaje de denuncia:', f'Se ha denunciado la prenda {prenda_nombre} (ID: {prenda_id})\nTalla: {prenda_talla}\nSexo: {prenda_sexo}\nEstado: {prenda_estado}\nDonante: {nombre_donante}\nMotivo: {motivo}')
    mensaje = f"""
¡Atención Administrador!

Se ha recibido una nueva denuncia sobre una publicación en DonatonUIS.

Detalles de la prenda denunciada:
  • Nombre: {prenda_nombre}
  • ID: {prenda_id}
  • Talla: {prenda_talla}
  • Sexo: {prenda_sexo}
  • Estado: {prenda_estado}
  • Donante: {nombre_donante}

Motivo de la denuncia:
"""
    mensaje += f"{motivo}\n\nPor favor, revise esta publicación y tome las acciones necesarias.\n\n— Sistema DonatonUIS"
    send_mail(
        subject='Nueva denuncia de prenda en DonatonUIS',
        message=mensaje,
        from_email='daniel2220088@correo.uis.edu.co',
        recipient_list=admin_emails,
        fail_silently=False,
    )
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([AllowAny])
def soporte_registro(request):
    from datetime import datetime
    from django.utils import timezone
    
    correo_usuario = request.data.get('correoUsuario')
    mensaje = request.data.get('mensaje')
    tipo = request.data.get('tipo', 'consulta_general')

    # Validaciones básicas
    if not correo_usuario or not mensaje:
        return Response({'error': 'Faltan datos requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

    # Obtener el correo del admin específico para soporte
    admin_email = 'julio2220089@correo.uis.edu.co'

    # Obtener fecha actual en formato legible
    fecha_actual = timezone.now().strftime('%d de %B de %Y a las %H:%M')
    # Traducir meses al español
    meses = {
        'January': 'enero', 'February': 'febrero', 'March': 'marzo', 'April': 'abril',
        'May': 'mayo', 'June': 'junio', 'July': 'julio', 'August': 'agosto',
        'September': 'septiembre', 'October': 'octubre', 'November': 'noviembre', 'December': 'diciembre'
    }
    for mes_en, mes_es in meses.items():
        fecha_actual = fecha_actual.replace(mes_en, mes_es)

    # print('DEBUG - Solicitud de soporte:', f'Usuario: {correo_usuario}, Tipo: {tipo}')
    # print('DEBUG - Mensaje:', mensaje)
    
    # Crear el mensaje de correo
    mensaje_correo = f"""
¡Nueva solicitud de soporte en DonatonUIS!

Detalles de la solicitud:
  • Correo del usuario: {correo_usuario}
  • Tipo de consulta: {tipo}
  • Fecha: {fecha_actual}

Mensaje del usuario:
{mensaje}

Por favor, responde directamente al correo del usuario lo antes posible.

— Sistema DonatonUIS
"""

    try:
        send_mail(
            subject='Nueva solicitud de soporte - DonatonUIS',
            message=mensaje_correo,
            from_email='daniel2220088@correo.uis.edu.co',
            recipient_list=[admin_email],
            fail_silently=False,
        )
        return Response({'success': True})
    except Exception as e:
        print(f'Error enviando correo de soporte: {e}')
        return Response({'error': 'Error al enviar la solicitud.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
