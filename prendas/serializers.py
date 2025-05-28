from rest_framework import serializers
from .models import Prenda, ImagenPrenda
from donaciones.models import Donacion
from solicitudes.models import Solicitud
from usuarios.models import Usuario
from usuarios.serializers import UsuarioSerializer

class ImagenPrendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenPrenda
        fields = ['id', 'imagen']

class PrendaSerializer(serializers.ModelSerializer):
    imagenes = ImagenPrendaSerializer(many=True, read_only=True)
    donante = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Prenda
        fields = '__all__'
        read_only_fields = ['donante']

    def get_donante(self, obj):
        if obj.donante:
            return {
                'id': obj.donante.id,
                'username': obj.donante.username,
                'nombre': obj.donante.nombre,
                'apellido': obj.donante.apellido,
                'foto': obj.donante.foto.url if obj.donante.foto else None,
            }
        return None

class PrendaAdminSerializer(serializers.ModelSerializer):
    postulados = serializers.SerializerMethodField()
    donante = serializers.SerializerMethodField()

    class Meta:
        model = Prenda
        fields = ['id', 'nombre', 'imagen_url', 'visitas', 'postulados', 'donante']

    def get_postulados(self, obj):
        return Solicitud.objects.filter(prenda=obj).count()

    def get_donante(self, obj):
        donacion = Donacion.objects.filter(prenda=obj).first()
        if donacion and donacion.usuario:
            return {
                'id': donacion.usuario.id,
                'nombre': donacion.usuario.nombre,
                'apellido': donacion.usuario.apellido,
                'foto': donacion.usuario.foto.url if donacion.usuario.foto else None,
            }
        return None
