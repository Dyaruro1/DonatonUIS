# Generated by Django 5.2.1 on 2025-05-29 20:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prendas', '0005_auto_20250528_1711'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prenda',
            name='fecha_publicacion',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
