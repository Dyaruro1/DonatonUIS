from django.db import models
from usuarios.models import Usuario
from prendas.models import Prenda

class Donacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='donaciones')
    prenda = models.ForeignKey(Prenda, on_delete=models.CASCADE, related_name='donaciones')
    fecha = models.DateTimeField()

    def __str__(self):
        return f"Donación de {self.usuario} - {self.prenda}"