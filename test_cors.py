#!/usr/bin/env python3
"""
Test script to verify CORS configuration for the password synchronization endpoint
"""
import requests
import json

def test_cors_endpoint():
    url = "http://localhost:8000/api/sincronizar-contrasena-supabase/"
    
    # Test data
    test_data = {
        "correo": "test@example.com",
        "nueva_contrasena": "test123"
    }
    
    # Headers to simulate frontend request
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5174',
        'Accept': 'application/json',
    }
    
    print("Testing CORS configuration...")
    print(f"URL: {url}")
    print(f"Data: {test_data}")
    print(f"Headers: {headers}")
    print("-" * 50)
    
    try:
        # First test OPTIONS request (CORS preflight)
        print("Testing OPTIONS (preflight) request...")
        options_response = requests.options(url, headers=headers)
        print(f"OPTIONS Status: {options_response.status_code}")
        print("OPTIONS Headers:")
        for header, value in options_response.headers.items():
            if 'access-control' in header.lower() or 'cors' in header.lower():
                print(f"  {header}: {value}")
        print()
        
        # Then test POST request
        print("Testing POST request...")
        response = requests.post(url, json=test_data, headers=headers)
        print(f"POST Status: {response.status_code}")
        print("POST Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower() or 'cors' in header.lower():
                print(f"  {header}: {value}")
        
        print(f"Response content: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_cors_endpoint()
