from django.db import models

class Prenda(models.Model):
    nombre = models.CharField(max_length=100)
    talla = models.CharField(max_length=20)
    SEXO_CHOICES = [
        ('masculino', 'Masculino'),
        ('femenino', 'Femenino'),
        ('otro', 'Otro'),
    ]
    sexo = models.CharField(max_length=10, choices=SEXO_CHOICES)
    uso = models.CharField(max_length=100, blank=True, null=True)
    imagen_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.nombre