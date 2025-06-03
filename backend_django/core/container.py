"""
Container de Inyección de Dependencias para DonatonUIS
Implementa el patrón Service Container para gestionar dependencias
"""
from typing import Any, Dict, Type, TypeVar, Callable
from dataclasses import dataclass, field


T = TypeVar('T')


@dataclass
class ServiceBinding:
    """Representa una vinculación de servicio en el container"""
    implementation: Type
    singleton: bool = False
    factory: Callable = None
    instance: Any = field(default=None, init=False)


class DIContainer:
    """Container de Inyección de Dependencias"""
    
    def __init__(self):
        self._bindings: Dict[str, ServiceBinding] = {}
        self._singletons: Dict[str, Any] = {}
    
    def bind(self, interface: Type[T], implementation: Type[T], singleton: bool = False) -> None:
        """Vincular una interfaz con su implementación"""
        key = self._get_key(interface)
        self._bindings[key] = ServiceBinding(
            implementation=implementation,
            singleton=singleton
        )
    
    def bind_factory(self, interface: Type[T], factory: Callable[[], T], singleton: bool = False) -> None:
        """Vincular una interfaz con una factory function"""
        key = self._get_key(interface)
        self._bindings[key] = ServiceBinding(
            implementation=None,
            factory=factory,
            singleton=singleton
        )
    
    def bind_instance(self, interface: Type[T], instance: T) -> None:
        """Vincular una interfaz con una instancia específica (siempre singleton)"""
        key = self._get_key(interface)
        self._singletons[key] = instance
        self._bindings[key] = ServiceBinding(
            implementation=None,
            singleton=True
        )
        self._bindings[key].instance = instance
    
    def get(self, interface: Type[T]) -> T:
        """Resolver una dependencia del container"""
        key = self._get_key(interface)
        
        # Si ya tenemos una instancia singleton, devolverla
        if key in self._singletons:
            return self._singletons[key]
        
        # Verificar si está vinculada
        if key not in self._bindings:
            raise ValueError(f"No hay binding para {interface.__name__}")
        
        binding = self._bindings[key]
        
        # Si ya tiene una instancia (de bind_instance), devolverla
        if binding.instance is not None:
            return binding.instance
        
        # Crear instancia
        if binding.factory:
            instance = binding.factory()
        else:
            instance = self._create_instance(binding.implementation)
        
        # Si es singleton, guardar la instancia
        if binding.singleton:
            self._singletons[key] = instance
            binding.instance = instance
        
        return instance
    
    def _create_instance(self, implementation: Type[T]) -> T:
        """Crear una instancia de la implementación con inyección de dependencias"""
        # Aquí podrías implementar inyección automática basada en type hints
        # Por simplicidad, usaremos construcción directa
        try:
            return implementation()
        except TypeError as e:
            # Si requiere argumentos, intentar inyección automática
            import inspect
            sig = inspect.signature(implementation.__init__)
            kwargs = {}
            
            for param_name, param in sig.parameters.items():
                if param_name == 'self':
                    continue
                    
                if param.annotation and param.annotation != inspect.Parameter.empty:
                    try:
                        kwargs[param_name] = self.get(param.annotation)
                    except ValueError:
                        # Si no se puede resolver, usar valor por defecto si existe
                        if param.default != inspect.Parameter.empty:
                            kwargs[param_name] = param.default
                        else:
                            raise ValueError(f"No se puede resolver dependencia {param.annotation.__name__} para {implementation.__name__}")
            
            return implementation(**kwargs)
    
    def _get_key(self, interface: Type) -> str:
        """Obtener clave única para la interfaz"""
        return f"{interface.__module__}.{interface.__name__}"
    
    def clear(self) -> None:
        """Limpiar todas las vinculaciones (útil para testing)"""
        self._bindings.clear()
        self._singletons.clear()


# Container global para la aplicación
container = DIContainer()


def inject(interface: Type[T]) -> T:
    """Función helper para inyectar dependencias"""
    return container.get(interface)


def configure_dependencies():
    """Configurar todas las dependencias de la aplicación"""
    from .implementations import (
        DjangoUserRepository,
        DjangoAuthenticationService,
        SupabaseAuthProvider,
        SupabaseNotificationService,
        DjangoPrendaRepository,
        LocalImageService,
        DjangoEmailService,
        UISEmailValidator
    )
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
    
    # Configurar vinculaciones
    container.bind(IUserRepository, DjangoUserRepository, singleton=True)
    container.bind(IAuthenticationService, DjangoAuthenticationService, singleton=True)
    container.bind(IExternalAuthProvider, SupabaseAuthProvider, singleton=True)
    container.bind(INotificationService, SupabaseNotificationService, singleton=True)
    container.bind(IPrendaRepository, DjangoPrendaRepository, singleton=True)
    container.bind(IImageService, LocalImageService, singleton=True)
    container.bind(IEmailService, DjangoEmailService, singleton=True)
    container.bind(IDomainValidator, UISEmailValidator, singleton=True)

# Alias para facilitar importación
Container = DIContainer

# Instancia global configurada
_global_container = None

def get_container() -> DIContainer:
    """Obtiene la instancia global del container configurado"""
    global _global_container
    if _global_container is None:
        configure_dependencies()
        _global_container = container
    return _global_container
