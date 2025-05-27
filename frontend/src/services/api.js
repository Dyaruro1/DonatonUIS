import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://localhost:8000'; // URL de tu backend Django

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
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funciones para interactuar con el API Django
export const authService = {
  login: (correo, contrasena) => 
    api.post('/api/login', new URLSearchParams({ username: correo, password: contrasena }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  register: (userData) => api.post('/usuarios/registrar', userData),
  // getCurrentUser y restablecerContrasena deben implementarse en Django si se requieren
};

export const donatonService = {
  donarRopa: (donacion) => api.post('/api/donaciones/', donacion),
  solicitarRopa: (solicitud) => api.post('/api/solicitudes/', solicitud),
  getPrendasDisponibles: (skip = 0, limit = 12) => api.get(`/api/prendas/?offset=${skip}&limit=${limit}`),
  getMisSolicitudes: (usuarioId) => api.get(`/api/solicitudes/?usuario=${usuarioId}`),
  getMisDonaciones: (usuarioId) => api.get(`/api/donaciones/?usuario=${usuarioId}`),
};

export default api;
