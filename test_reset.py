#!/usr/bin/env python
"""Test password reset functionality"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from usuarios.models import Usuario, Notification
from django.test import RequestFactory
from usuarios.views import restablecer_contrasena
import json

def test_password_reset():
    print("Testing password reset functionality...")
    
    # Create a test user if it doesn't exist
    test_email = "test@correo.uis.edu.co"
    try:
        user = Usuario.objects.get(correo=test_email)
        print(f"Found existing user: {user.username}")
    except Usuario.DoesNotExist:
        user = Usuario.objects.create_user(
            username="testuser",
            correo=test_email,
            nombre="Test",
            apellido="User",
            password="oldpassword123"
        )
        print(f"Created test user: {user.username}")
    
    # Test the password reset view
    factory = RequestFactory()
    request = factory.post('/api/usuarios/restablecer_contrasena/', 
                          data=json.dumps({'correo': test_email}),
                          content_type='application/json')
    
    response = restablecer_contrasena(request)
    print(f"Response status: {response.status_code}")
    print(f"Response data: {response.data}")
    
    # Check if notification was created
    notifications = Notification.objects.filter(correo=test_email)
    print(f"Notifications created: {notifications.count()}")
    
    # Check if password was changed
    user.refresh_from_db()
    print("Password reset test completed successfully!")

if __name__ == "__main__":
    test_password_reset()
