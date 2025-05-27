import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Comprobar si hay un token en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Aquí podrías implementar la verificación del usuario actual si tienes endpoint, pero por ahora solo marca loading false
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);
  
  // Función para iniciar sesión
  const login = async (correo, contrasena) => {
    try {
      const response = await authService.login(correo, contrasena);
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.usuario);
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
  
  const value = {
    currentUser,
    loading,
    login,
    logout,
    register
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
