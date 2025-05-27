from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.ImageField(max_length=None, use_url=True, required=False, allow_null=True)
    class Meta:
        model = Usuario
        fields = '__all__'
