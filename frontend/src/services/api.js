import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://localhost:8000'; // URL de tu backend FastAPI

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funciones para interactuar con el API
export const authService = {
  login: (correo, contrasena) => api.post('/login', { correo, contrasena }),
  register: (userData) => api.post('/usuarios/registrar', userData),
  getCurrentUser: () => api.get('/usuarios/me'),
  restablecerContrasena: (correo) => api.post('/usuarios/restablecer-contrasena', { correo }),
};

export const donatonService = {
  donarRopa: (donacion) => api.post('/donaciones', donacion),
  solicitarRopa: (solicitud) => api.post('/solicitudes', solicitud),
  getPrendasDisponibles: (skip = 0, limit = 12) => api.get(`/prendas?skip=${skip}&limit=${limit}`),
  getMisSolicitudes: () => api.get('/solicitudes/usuario'),
  getMisDonaciones: () => api.get('/donaciones/usuario'),
};

export default api;
