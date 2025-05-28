from django.utils import timezone

class UpdateLastActiveMiddleware:
    """
    Middleware para actualizar el campo last_active del usuario autenticado en cada request.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            # Solo actualiza si han pasado al menos 30 segundos desde la última vez
            if not user.last_active or (timezone.now() - user.last_active).total_seconds() > 30:
                user.last_active = timezone.now()
                user.save(update_fields=["last_active"])
        return response
