from rest_framework import serializers
from .models import Usuario
from django.contrib.auth.hashers import make_password

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True, allow_empty_file=True)
    contrasena = serializers.CharField(write_only=True, required=True)
    nombre_usuario = serializers.CharField(write_only=True, required=True)
    descripcion = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    contacto1 = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    contacto2 = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Si es update (PATCH/PUT), no exigir contrasena ni nombre_usuario
        request = self.context.get('request') if 'context' in self.__dict__ else None
        if request and request.method in ['PUT', 'PATCH']:
            self.fields['contrasena'].required = False
            self.fields['nombre_usuario'].required = False

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'nombre_usuario', 'nombre', 'apellido', 'correo', 'contrasena',
            'sexo', 'fecha_nacimiento', 'telefono', 'foto', 'first_name', 'last_name', 'email',
            'descripcion', 'contacto1', 'contacto2', 'tipoUsuario'
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

    def update(self, instance, validated_data):
        # Mapear nombre_usuario a username si viene en el update
        if 'nombre_usuario' in validated_data:
            instance.username = validated_data.pop('nombre_usuario')
        # Si se actualiza la contraseña, hashearla
        if 'contrasena' in validated_data:
            instance.password = make_password(validated_data.pop('contrasena'))
        # Actualizar el resto de los campos normalmente
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def validate(self, data):
        # Validar que el nombre de usuario no exista
        username = data.get('nombre_usuario')
        correo = data.get('correo')
        if username and Usuario.objects.filter(username=username).exists():
            raise serializers.ValidationError({'nombre_usuario': 'Este nombre de usuario ya está en uso.'})
        if correo and Usuario.objects.filter(correo=correo).exists():
            raise serializers.ValidationError({'correo': 'Este correo ya está en uso.'})
        return data
