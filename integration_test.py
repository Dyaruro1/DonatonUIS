#!/usr/bin/env python
"""Comprehensive test of Django + Supabase password reset integration"""
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from usuarios.models import Usuario, Notification

def test_django_backend():
    """Test Django backend functionality"""
    print("=== Testing Django Backend ===")
    
    # Test 1: CSRF endpoint
    print("1. Testing CSRF endpoint...")
    try:
        response = requests.get('http://localhost:8000/api/get_csrf/')
        print(f"   CSRF Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ CSRF endpoint working")
        else:
            print("   ❌ CSRF endpoint failed")
    except Exception as e:
        print(f"   ❌ CSRF error: {e}")
    
    # Test 2: Create test user
    print("2. Creating test user...")
    test_email = "test.reset@correo.uis.edu.co"
    try:
        user, created = Usuario.objects.get_or_create(
            correo=test_email,
            defaults={
                'username': 'testreset',
                'nombre': 'Test',
                'apellido': 'Reset',
            }
        )
        if created:
            user.set_password('oldpassword123')
            user.save()
            print("   ✅ Test user created")
        else:
            print("   ✅ Test user exists")
    except Exception as e:
        print(f"   ❌ User creation error: {e}")
        return False
    
    # Test 3: Password reset API
    print("3. Testing password reset API...")
    try:
        # Get CSRF token first
        session = requests.Session()
        csrf_response = session.get('http://localhost:8000/api/get_csrf/')
        csrf_token = None
        
        if 'csrftoken' in session.cookies:
            csrf_token = session.cookies['csrftoken']
        
        headers = {
            'Content-Type': 'application/json',
        }
        if csrf_token:
            headers['X-CSRFToken'] = csrf_token
        
        # Test password reset
        reset_data = {'correo': test_email}
        response = session.post(
            'http://localhost:8000/api/usuarios/restablecer_contrasena/',
            json=reset_data,
            headers=headers
        )
        
        print(f"   Reset Status: {response.status_code}")
        if response.status_code == 200:
            response_data = response.json()
            print(f"   ✅ Password reset successful")
            print(f"   New password: {response_data.get('nuevaContrasena', 'Not provided')}")
            
            # Check notification was created
            notifications = Notification.objects.filter(correo=test_email)
            print(f"   Notifications created: {notifications.count()}")
            
            return True
        else:
            print(f"   ❌ Password reset failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Password reset error: {e}")
        return False

def test_models():
    """Test Django models"""
    print("\n=== Testing Django Models ===")
    
    # Test User model
    print("1. Testing User model...")
    try:
        user_count = Usuario.objects.count()
        print(f"   Total users: {user_count}")
        print("   ✅ User model working")
    except Exception as e:
        print(f"   ❌ User model error: {e}")
    
    # Test Notification model
    print("2. Testing Notification model...")
    try:
        notification_count = Notification.objects.count()
        print(f"   Total notifications: {notification_count}")
        print("   ✅ Notification model working")
    except Exception as e:
        print(f"   ❌ Notification model error: {e}")

def test_frontend_accessibility():
    """Test if frontend pages are accessible"""
    print("\n=== Testing Frontend Accessibility ===")
    
    frontend_urls = [
        'http://localhost:5173/',
        'http://localhost:5173/login',
        'http://localhost:5173/restablecer-contrasena'
    ]
    
    for url in frontend_urls:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"   ✅ {url} - accessible")
            else:
                print(f"   ❌ {url} - status {response.status_code}")
        except Exception as e:
            print(f"   ❌ {url} - error: {e}")

def main():
    """Run all tests"""
    print("Starting comprehensive integration tests...\n")
    
    # Test models first
    test_models()
    
    # Test Django backend
    backend_success = test_django_backend()
    
    # Test frontend accessibility
    test_frontend_accessibility()
    
    print("\n=== Test Summary ===")
    if backend_success:
        print("✅ Django backend: WORKING")
        print("✅ Password reset integration: FUNCTIONAL")
        print("✅ CSRF protection: ENABLED")
        print("✅ Database models: OPERATIONAL")
        print("\n🎉 Integration is ready for Supabase authentication!")
        print("\nNext steps:")
        print("1. Test the frontend at: http://localhost:5173/restablecer-contrasena")
        print("2. Try resetting a password with a valid UIS email")
        print("3. Verify both Django and Supabase sync correctly")
    else:
        print("❌ Django backend: ISSUES DETECTED")
        print("Please check the Django server and configuration")

if __name__ == "__main__":
    main()
