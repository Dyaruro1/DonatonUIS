# Generated by Django 5.2.1 on 2025-05-30 11:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prendas', '0009_imagenprenda_ruta_local'),
    ]

    operations = [
        migrations.AddField(
            model_name='prenda',
            name='foto',
            field=models.ImageField(blank=True, null=True, upload_to='prendas/'),
        ),
    ]
