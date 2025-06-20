from django.db import models
from usuarios.models import Usuario

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
    descripcion = models.TextField(blank=True, null=True)  # NUEVO: descripción de la prenda
    donante = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='prendas_donadas')  # Obligatorio
    fecha_publicacion = models.DateTimeField(auto_now_add=True)  # NUEVO: fecha de publicación
    visitas = models.PositiveIntegerField(default=0)
    STATUS_CHOICES = [
        ('disponible', 'Disponible'),
        ('en_solicitud', 'En solicitud'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponible')

    UPLOAD_STATUS_CHOICES = [
        ('En espera', 'En espera'),
        ('Cargado', 'Cargado'),
    ]
    upload_status = models.CharField(max_length=20, choices=UPLOAD_STATUS_CHOICES, default='Cargado')
    foto1 = models.ImageField(upload_to='prendas/', blank=True, null=True)
    foto2 = models.ImageField(upload_to='prendas/', blank=True, null=True)
    foto3 = models.ImageField(upload_to='prendas/', blank=True, null=True)

    def __str__(self):
        return self.nombre

class ImagenPrenda(models.Model):
    prenda = models.ForeignKey(Prenda, related_name='imagenes', on_delete=models.CASCADE)
    imagen = models.ImageField(upload_to='prendas/')  # Esto ya guarda en media/prendas/ y es accesible por URL si MEDIA_URL está bien configurado
    ruta_local = models.CharField(max_length=255, blank=True, null=True)  # NUEVO: ruta local del archivo

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Guardar la ruta local después de guardar la imagen
        if self.imagen and self.ruta_local != self.imagen.name:
            self.ruta_local = self.imagen.name
            super().save(update_fields=['ruta_local'])

    def __str__(self):
        return f"Imagen de {self.prenda.nombre}"