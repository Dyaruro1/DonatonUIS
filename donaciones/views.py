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

    print('DEBUG - Correos admin:', admin_emails)
    print('DEBUG - Mensaje de denuncia:', f'Se ha denunciado la prenda {prenda_nombre} (ID: {prenda_id})\nTalla: {prenda_talla}\nSexo: {prenda_sexo}\nEstado: {prenda_estado}\nDonante: {nombre_donante}\nMotivo: {motivo}')
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
