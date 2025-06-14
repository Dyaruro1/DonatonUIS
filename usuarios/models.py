from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    SEXO_CHOICES = [
        ('masculino', 'Masculino'),
        ('femenino', 'Femenino'),
        ('otro', 'Otro'),
    ]
    sexo = models.CharField(max_length=10, choices=SEXO_CHOICES, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    foto = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    contacto1 = models.CharField(max_length=100, blank=True, null=True)
    contacto2 = models.CharField(max_length=100, blank=True, null=True)
    tipoUsuario = models.CharField(max_length=50, blank=True, null=True, default="estandar")
    last_active = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'correo'
    REQUIRED_FIELDS = ['correo', 'nombre', 'apellido']

    def __str__(self):
        return self.username

class Notification(models.Model):
    correo = models.EmailField()
    nuevaContrasena = models.CharField(max_length=10)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Notificación para {self.correo}"

