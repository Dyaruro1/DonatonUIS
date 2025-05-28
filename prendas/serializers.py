from rest_framework import serializers
from .models import Prenda
from donaciones.models import Donacion
from solicitudes.models import Solicitud
from usuarios.models import Usuario

class PrendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prenda
        fields = '__all__'

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
