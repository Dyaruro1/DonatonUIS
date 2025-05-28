import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Cargar usuario actual desde el backend
      authService.getCurrentUser()
        .then(res => {
          setCurrentUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          setCurrentUser(null);
          setLoading(false);
        });
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);
  
  // Función para iniciar sesión
  const login = async (correo, contrasena) => {
    try {
      const response = await authService.login(correo, contrasena);
      localStorage.setItem('token', response.data.token);
      // Fetch the current user from backend to ensure fresh data
      const userRes = await authService.getCurrentUser();
      setCurrentUser(userRes.data);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  // Función para registrar nuevo usuario
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  // Función para actualizar el perfil del usuario autenticado
  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Función para refrescar el usuario desde el backend
  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setCurrentUser(response.data);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  // Función para cambiar la contraseña del usuario autenticado
  const cambiarContrasena = async (contrasena_anterior, contrasena_nueva) => {
    try {
      const response = await authService.cambiarContrasena(contrasena_anterior, contrasena_nueva);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Error al cambiar la contraseña.' };
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    updateProfile,
    refreshUser,
    cambiarContrasena
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
