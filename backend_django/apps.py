"""
Configuración de la aplicación Django con inicialización del container DI
"""
from django.apps import AppConfig


class BackendDjangoConfig(AppConfig):
    """Configuración principal de la aplicación Django"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend_django'
    verbose_name = 'Backend Django Application'
    
    def ready(self):
        """Configurar dependencias cuando Django esté listo"""
        # Importar y configurar el container de inyección de dependencias
        try:
            from .core.container import configure_dependencies
            configure_dependencies()
            print("✅ Dependency Injection Container configurado exitosamente")
        except Exception as e:
            print(f"❌ Error configurando DI Container: {e}")
            # No fallar la aplicación si hay problemas con DI
            pass
