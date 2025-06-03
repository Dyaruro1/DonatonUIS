"""
Abstracciones base para cumplir con el Dependency Inversion Principle (DIP)
Estas interfaces definen contratos que deben cumplir las implementaciones concretas
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from django.contrib.auth.models import AbstractUser


class IUserRepository(ABC):
    """Interfaz para operaciones de repositorio de usuarios"""
    
    @abstractmethod
    def create_user(self, user_data: Dict[str, Any]) -> AbstractUser:
        """Crear un nuevo usuario"""
        pass
    
    @abstractmethod
    def get_user_by_email(self, email: str) -> Optional[AbstractUser]:
        """Obtener usuario por email"""
        pass
    
    @abstractmethod
    def get_user_by_username(self, username: str) -> Optional[AbstractUser]:
        """Obtener usuario por username"""
        pass
    
    @abstractmethod
    def update_user(self, user: AbstractUser, data: Dict[str, Any]) -> AbstractUser:
        """Actualizar datos de usuario"""
        pass
    
    @abstractmethod
    def delete_user(self, user: AbstractUser) -> bool:
        """Eliminar usuario"""
        pass
    
    @abstractmethod
    def email_exists(self, email: str) -> bool:
        """Verificar si email existe"""
        pass


class IAuthenticationService(ABC):
    """Interfaz para servicios de autenticación"""
    
    @abstractmethod
    def authenticate(self, email: str, password: str) -> Optional[AbstractUser]:
        """Autenticar usuario con email y contraseña"""
        pass
    
    @abstractmethod
    def create_token(self, user: AbstractUser) -> str:
        """Crear token de autenticación"""
        pass
    
    @abstractmethod
    def validate_token(self, token: str) -> Optional[AbstractUser]:
        """Validar token y retornar usuario"""
        pass


class IExternalAuthProvider(ABC):
    """Interfaz para proveedores de autenticación externa"""
    
    @abstractmethod
    def create_user(self, email: str, password: str, **kwargs) -> Dict[str, Any]:
        """Crear usuario en proveedor externo"""
        pass
    
    @abstractmethod
    def update_password(self, email: str, new_password: str) -> bool:
        """Actualizar contraseña en proveedor externo"""
        pass
    
    @abstractmethod
    def delete_user(self, email: str) -> bool:
        """Eliminar usuario del proveedor externo"""
        pass


class INotificationService(ABC):
    """Interfaz para servicios de notificación"""
    
    @abstractmethod
    def send_notification(self, user_id: str, message: str, **kwargs) -> bool:
        """Enviar notificación a usuario"""
        pass
    
    @abstractmethod
    def create_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear notificación en el sistema"""
        pass


class IPrendaRepository(ABC):
    """Interfaz para operaciones de repositorio de prendas"""
    
    @abstractmethod
    def create_prenda(self, prenda_data: Dict[str, Any]) -> Any:
        """Crear nueva prenda"""
        pass
    
    @abstractmethod
    def get_prenda_by_id(self, prenda_id: int) -> Any:
        """Obtener prenda por ID"""
        pass
    
    @abstractmethod
    def update_prenda(self, prenda: Any, data: Dict[str, Any]) -> Any:
        """Actualizar prenda"""
        pass
    
    @abstractmethod
    def delete_prenda(self, prenda: Any) -> bool:
        """Eliminar prenda"""
        pass
    
    @abstractmethod
    def get_prendas_by_status(self, status: str) -> List[Any]:
        """Obtener prendas por estado"""
        pass
    
    @abstractmethod
    def increment_visits(self, prenda_id: int) -> bool:
        """Incrementar visitas de prenda"""
        pass


class IImageService(ABC):
    """Interfaz para servicios de manejo de imágenes"""
    
    @abstractmethod
    def upload_image(self, image_file: Any, path: str) -> str:
        """Subir imagen y retornar URL"""
        pass
    
    @abstractmethod
    def delete_image(self, image_path: str) -> bool:
        """Eliminar imagen"""
        pass
    
    @abstractmethod
    def get_image_url(self, image_path: str) -> str:
        """Obtener URL de imagen"""
        pass


class IEmailService(ABC):
    """Interfaz para servicios de email"""
    
    @abstractmethod
    def send_email(self, to: str, subject: str, message: str) -> bool:
        """Enviar email"""
        pass
    
    @abstractmethod
    def send_password_reset(self, email: str, new_password: str) -> bool:
        """Enviar email de reset de contraseña"""
        pass


class IDomainValidator(ABC):
    """Interfaz para validadores de dominio"""
    
    @abstractmethod
    def validate_email_domain(self, email: str) -> bool:
        """Validar dominio de email"""
        pass
    
    @abstractmethod
    def validate_email(self, email: str) -> bool:
        """Validar formato de email"""
        pass
    
    @abstractmethod
    def validate_password_strength(self, password: str) -> bool:
        """Validar fortaleza de contraseña"""
        pass
    
    @abstractmethod
    def validate_password(self, password: str) -> bool:
        """Validar contraseña básica"""
        pass
    
    @abstractmethod
    def validate_username(self, username: str) -> bool:
        """Validar nombre de usuario"""
        pass
