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
    imagenes_ruta = serializers.SerializerMethodField(read_only=True)
    foto_url = serializers.SerializerMethodField(read_only=True)  # NUEVO

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

    def get_imagenes_ruta(self, obj):
        # Devuelve una lista con la ruta local de cada imagen
        return [img.imagen.name for img in obj.imagenes.all()]

    def get_foto_url(self, obj):
        # Compatibilidad: regresa la primera foto disponible
        if hasattr(obj, 'foto1') and obj.foto1:
            return obj.foto1.url
        if hasattr(obj, 'foto2') and obj.foto2:
            return obj.foto2.url
        if hasattr(obj, 'foto3') and obj.foto3:
            return obj.foto3.url
        return None

class PrendaAdminSerializer(serializers.ModelSerializer):
    postulados = serializers.SerializerMethodField()
    donante = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()
    imagenes = ImagenPrendaSerializer(many=True, read_only=True)
    foto_url = serializers.SerializerMethodField(read_only=True)  # NUEVO
    foto1_url = serializers.SerializerMethodField(read_only=True)
    foto2_url = serializers.SerializerMethodField(read_only=True)
    foto3_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Prenda
        fields = ['id', 'nombre', 'imagen_url', 'imagenes', 'foto_url', 'visitas', 'postulados', 'donante', 'foto1_url', 'foto2_url', 'foto3_url']

    def get_postulados(self, obj):
        from solicitudes.models import Solicitud
        return Solicitud.objects.filter(prenda=obj).count()

    def get_donante(self, obj):
        from donaciones.models import Donacion
        donacion = Donacion.objects.filter(prenda=obj).first()
        if donacion and donacion.usuario:
            return {
                'id': donacion.usuario.id,
                'nombre': donacion.usuario.nombre,
                'apellido': donacion.usuario.apellido,
                'foto': donacion.usuario.foto.url if donacion.usuario.foto else None,
            }
        return None

    def get_imagen_url(self, obj):
        # Devuelve la URL de la primera imagen si existe
        if obj.imagenes.exists():
            return obj.imagenes.first().imagen.url
        return None

    def get_foto_url(self, obj):
        # Compatibilidad: regresa la primera foto disponible
        if hasattr(obj, 'foto1') and obj.foto1:
            return obj.foto1.url
        if hasattr(obj, 'foto2') and obj.foto2:
            return obj.foto2.url
        if hasattr(obj, 'foto3') and obj.foto3:
            return obj.foto3.url
        return None

    def get_foto1_url(self, obj):
        return obj.foto1.url if obj.foto1 else None

    def get_foto2_url(self, obj):
        return obj.foto2.url if obj.foto2 else None

    def get_foto3_url(self, obj):
        return obj.foto3.url if obj.foto3 else None
