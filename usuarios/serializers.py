from rest_framework import serializers
from .models import Usuario
from django.contrib.auth.hashers import make_password

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True, allow_empty_file=True)
    contrasena = serializers.CharField(write_only=True, required=True)
    nombre_usuario = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'nombre_usuario', 'nombre', 'apellido', 'correo', 'contrasena',
            'sexo', 'fecha_nacimiento', 'telefono', 'foto', 'first_name', 'last_name', 'email'
        ]
        extra_kwargs = {
            'username': {'read_only': True},
        }

    def to_internal_value(self, data):
        # Si foto es string vacía, conviértelo a None
        if 'foto' in data and (data['foto'] == '' or data['foto'] is None):
            data['foto'] = None
        return super().to_internal_value(data)

    def create(self, validated_data):
        # Mapear nombre_usuario a username
        if 'nombre_usuario' in validated_data:
            validated_data['username'] = validated_data.pop('nombre_usuario')
        if 'contrasena' in validated_data:
            validated_data['password'] = make_password(validated_data.pop('contrasena'))
        validated_data['is_active'] = True  # Asegura que el usuario esté activo
        if 'foto' in validated_data and not validated_data['foto']:
            validated_data['foto'] = None
        return super().create(validated_data)
