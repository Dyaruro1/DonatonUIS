from rest_framework import serializers
from .models import Donacion

class DonacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donacion
        fields = '__all__'
