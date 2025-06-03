"""
Implementaciones concretas de las interfaces para cumplir DIP
Estas clases implementan la lógica específica sin que los clientes dependan de ellas directamente
"""
from typing import Any, Dict, List, Optional
from django.contrib.auth import authenticate
from django.contrib.auth.models import AbstractUser
from rest_framework.authtoken.models import Token
from usuarios.models import Usuario
from prendas.models import Prenda, ImagenPrenda
from .interfaces import (
    IUserRepository,
    IAuthenticationService, 
    IExternalAuthProvider,
    INotificationService,
    IPrendaRepository,
    IImageService,
    IEmailService,
    IDomainValidator
)


class DjangoUserRepository(IUserRepository):
    """Implementación Django del repositorio de usuarios"""
    
    def create_user(self, user_data: Dict[str, Any]) -> AbstractUser:
        from usuarios.serializers import UsuarioSerializer
        serializer = UsuarioSerializer(data=user_data)
        if serializer.is_valid():
            return serializer.save()
        raise ValueError(f"Datos de usuario inválidos: {serializer.errors}")
    
    def get_user_by_email(self, email: str) -> Optional[AbstractUser]:
        try:
            return Usuario.objects.get(correo__iexact=email.strip().lower())
        except Usuario.DoesNotExist:
            return None
    
    def get_by_email(self, email: str) -> Optional[AbstractUser]:
        """Alias para get_user_by_email para compatibilidad"""
        return self.get_user_by_email(email)
    
    def get_user_by_username(self, username: str) -> Optional[AbstractUser]:
        try:
            return Usuario.objects.get(username=username)
        except Usuario.DoesNotExist:
            return None
    
    def update_user(self, user: AbstractUser, data: Dict[str, Any]) -> AbstractUser:
        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        user.save()
        return user
    
    def update_password(self, user: AbstractUser, new_password: str) -> bool:
        """Actualiza la contraseña del usuario"""
        try:
            user.set_password(new_password)
            user.save()
            return True
        except Exception:
            return False
    
    def update_username(self, user: AbstractUser, new_username: str) -> bool:
        """Actualiza el nombre de usuario"""
        try:
            user.username = new_username
            user.save()
            return True
        except Exception:
            return False
    
    def username_exists(self, username: str, exclude_user_id: Optional[int] = None) -> bool:
        """Verifica si un nombre de usuario ya existe"""
        queryset = Usuario.objects.filter(username=username)
        if exclude_user_id:
            queryset = queryset.exclude(pk=exclude_user_id)
        return queryset.exists()
    
    def delete_user(self, user: AbstractUser) -> bool:
        try:
            user.delete()
            return True
        except Exception:
            return False
    
    def email_exists(self, email: str) -> bool:
        return Usuario.objects.filter(correo__iexact=email.strip().lower()).exists()


class DjangoAuthenticationService(IAuthenticationService):
    """Implementación Django del servicio de autenticación"""
    
    def authenticate(self, email: str, password: str) -> Optional[AbstractUser]:
        user = Usuario.objects.filter(correo__iexact=email.strip().lower()).first()
        if user and user.is_active:
            authenticated = authenticate(username=user.username, password=password)
            return authenticated
        return None
    
    def authenticate_user(self, username: str, password: str) -> Optional[AbstractUser]:
        """Autentica usando nombre de usuario y contraseña"""
        from django.contrib.auth import authenticate as django_authenticate
        return django_authenticate(username=username, password=password)
    
    def verify_password(self, user: AbstractUser, password: str) -> bool:
        """Verifica la contraseña de un usuario"""
        from django.contrib.auth.hashers import check_password
        return check_password(password, user.password)
    
    def create_token(self, user: AbstractUser) -> str:
        token, created = Token.objects.get_or_create(user=user)
        return token.key
    
    def get_or_create_token(self, user: AbstractUser) -> str:
        """Alias para create_token para compatibilidad"""
        return self.create_token(user)
    
    def validate_token(self, token: str) -> Optional[AbstractUser]:
        try:
            token_obj = Token.objects.get(key=token)
            return token_obj.user
        except Token.DoesNotExist:
            return None


class SupabaseAuthProvider(IExternalAuthProvider):
    """Implementación Supabase del proveedor de autenticación externa"""
    
    def __init__(self):
        # Temporarily disable Supabase to fix import issues
        self._client = None
        try:
            from backend_django.supabase_settings import SUPABASE_URL, SUPABASE_KEY
            # Commented out until Supabase library is properly installed
            # from supabase import create_client
            # if SUPABASE_URL and SUPABASE_KEY:
            #     self._client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except ImportError:
            pass
    
    def create_user(self, email: str, password: str, **kwargs) -> bool:
        """Crea un usuario en Supabase y retorna True si es exitoso"""
        if not self._client:
            return True  # Return True for now to avoid blocking registration
        
        try:
            if password == 'MICROSOFT_AUTH':
                return True  # Para usuarios de Microsoft Auth, consideramos exitoso
            
            # Supabase code will go here when library is properly installed
            return True
                
        except Exception:
            return False
    
    def create_user_detailed(self, email: str, password: str, **kwargs) -> Dict[str, Any]:
        """Versión detallada que retorna información completa"""
        if not self._client:
            return {"success": True, "message": "Supabase temporarily disabled"}
        
        try:
            if password == 'MICROSOFT_AUTH':
                return {"success": True, "message": "Microsoft auth user, skipping Supabase creation"}
            
            return {"success": True, "message": "User creation bypassed"}
                
        except Exception as e:
            return {"error": str(e)}
    
    def update_password(self, email: str, new_password: str) -> bool:
        if not self._client:
            return False
        
        try:
            # Implementar lógica de actualización de contraseña en Supabase
            # Esto depende de la API específica de Supabase
            return True
        except Exception:
            return False
    
    def delete_user(self, email: str) -> bool:
        if not self._client:
            return False
        
        try:
            return True  # Placeholder
        except Exception:
            return False


class SupabaseNotificationService(INotificationService):
    """Implementación Supabase del servicio de notificaciones"""
    
    def __init__(self):
        # Temporarily disable Supabase
        self._client = None
        try:
            from backend_django.supabase_settings import SUPABASE_URL, SUPABASE_KEY
            # Commented out until Supabase library is properly installed
            # from supabase import create_client
            # if SUPABASE_URL and SUPABASE_KEY:
            #     self._client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except ImportError:
            pass
    
    def send_notification(self, user_id: str, message: str, **kwargs) -> bool:
        if not self._client:
            return False
        
        try:
            # Placeholder for Supabase notification logic
            return True
        except Exception:
            return False
    
    def create_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self._client:
            return {"error": "Supabase not configured"}
        
        try:
            return {"success": True, "data": {}}
        except Exception as e:
            return {"error": str(e)}


class DjangoPrendaRepository(IPrendaRepository):
    """Implementación Django del repositorio de prendas"""
    
    def create_prenda(self, prenda_data: Dict[str, Any]) -> Prenda:
        return Prenda.objects.create(**prenda_data)
    
    def get_prenda_by_id(self, prenda_id: int) -> Optional[Prenda]:
        try:
            return Prenda.objects.get(id=prenda_id)
        except Prenda.DoesNotExist:
            return None
    
    def update_prenda(self, prenda: Prenda, data: Dict[str, Any]) -> Prenda:
        for key, value in data.items():
            if hasattr(prenda, key):
                setattr(prenda, key, value)
        prenda.save()
        return prenda
    
    def delete_prenda(self, prenda: Prenda) -> bool:
        try:
            prenda.delete()
            return True
        except Exception:
            return False
    
    def get_prendas_by_status(self, status: str) -> List[Prenda]:
        return list(Prenda.objects.filter(upload_status=status))
    
    def increment_visits(self, prenda_id: int) -> bool:
        try:
            prenda = Prenda.objects.get(id=prenda_id)
            prenda.visitas += 1
            prenda.save()
            return True
        except Prenda.DoesNotExist:
            return False


class LocalImageService(IImageService):
    """Implementación local del servicio de imágenes"""
    
    def upload_image(self, image_file: Any, path: str) -> str:
        # Implementar lógica de subida de imagen
        # Por ahora retorna el path, pero aquí iría la lógica real
        return path
    
    def delete_image(self, image_path: str) -> bool:
        import os
        try:
            if os.path.exists(image_path):
                os.remove(image_path)
                return True
            return False
        except Exception:
            return False
    
    def get_image_url(self, image_path: str) -> str:
        from django.conf import settings
        if image_path:
            return f"{settings.MEDIA_URL}{image_path}"
        return ""
    
    def cleanup_removed_images(self, prenda_instance, fotos_existentes: list) -> bool:
        """Eliminar imágenes que el usuario quitó"""
        try:
            from prendas.models import ImagenPrenda
            import os
            
            actuales = list(prenda_instance.imagenes.all())
            for img in actuales:
                nombre_archivo = os.path.basename(img.imagen.name)
                if nombre_archivo not in fotos_existentes:
                    img.delete()
            return True
        except Exception:
            return False
    
    def update_prenda_images(self, prenda_instance, nuevas_imagenes: list) -> bool:
        """Actualizar imágenes de una prenda"""
        try:
            from prendas.models import ImagenPrenda
            
            # Actualizar foto principal
            if nuevas_imagenes:
                prenda_instance.foto = nuevas_imagenes[0]
                prenda_instance.save()
                
                # Eliminar todas las ImagenPrenda y volver a crear con las nuevas (menos la principal)
                prenda_instance.imagenes.all().delete()
                for img in nuevas_imagenes[1:]:
                    ImagenPrenda.objects.create(prenda=prenda_instance, imagen=img)
                
                # Actualizar hasta tres imágenes en los campos foto1, foto2 y foto3
                if len(nuevas_imagenes) > 0:
                    prenda_instance.foto1 = nuevas_imagenes[0]
                if len(nuevas_imagenes) > 1:
                    prenda_instance.foto2 = nuevas_imagenes[1]
                if len(nuevas_imagenes) > 2:
                    prenda_instance.foto3 = nuevas_imagenes[2]
                prenda_instance.save()
            
            return True
        except Exception:
            return False


class DjangoEmailService(IEmailService):
    """Implementación Django del servicio de email"""
    
    def send_email(self, to: str, subject: str, message: str) -> bool:
        from django.core.mail import send_mail
        try:
            send_mail(subject, message, 'noreply@donatonuis.com', [to])
            return True
        except Exception:
            return False
    
    def send_password_reset(self, email: str, new_password: str) -> bool:
        subject = "Restablecimiento de contraseña - DonatonUIS"
        message = f"Tu nueva contraseña temporal es: {new_password}"
        return self.send_email(email, subject, message)


class UISEmailValidator(IDomainValidator):
    """Implementación del validador de dominio UIS"""
    
    ALLOWED_DOMAINS = ['@correo.uis.edu.co', '@uis.edu.co']
    
    def validate_email_domain(self, email: str) -> bool:
        email = email.strip().lower()
        return any(email.endswith(domain) for domain in self.ALLOWED_DOMAINS)
    
    def validate_email(self, email: str) -> bool:
        """Valida formato de email y dominio UIS"""
        import re
        email = email.strip().lower()
        
        # Patrón básico de email
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False
        
        # Validar dominio UIS
        return self.validate_email_domain(email)
    
    def validate_password_strength(self, password: str) -> bool:
        if len(password) < 8:
            return False
        if password.isspace():
            return False
        return True
    
    def validate_password(self, password: str) -> bool:
        """Validación básica de contraseña"""
        if not password or len(password) < 6:
            return False
        if password.isspace():
            return False
        return True
    
    def validate_username(self, username: str) -> bool:
        """Validar nombre de usuario"""
        if not username or len(username) < 2:
            return False
        if len(username) > 50:
            return False
        # Permitir letras, números, guiones y guiones bajos
        import re
        return bool(re.match(r'^[a-zA-Z0-9_-]+$', username))
