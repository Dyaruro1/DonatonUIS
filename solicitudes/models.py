from django.db import models
from usuarios.models import Usuario
from prendas.models import Prenda

class Solicitud(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='solicitudes')
    prenda = models.ForeignKey(Prenda, on_delete=models.CASCADE)
    fecha = models.DateTimeField()
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    ]
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')

    def __str__(self):
        return f"Solicitud de {self.usuario} - {self.prenda}"