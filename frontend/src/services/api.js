import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://localhost:8000'; // URL de tu backend FastAPI

const api = axios.create({
  baseURL: API_URL,
  // No pongas headers aquí, axios los gestiona por request
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

// Funciones para interactuar con el API
export const authService = {
  login: (correo, contrasena) => 
    api.post('/api/login/', { correo, password: contrasena }, { headers: { 'Content-Type': 'application/json' } }),
  register: (userData) => {
    // Si es FormData, no pongas headers, axios lo hace solo
    const isFormData = (typeof FormData !== 'undefined') && userData instanceof FormData;
    const config = isFormData ? {} : { headers: { 'Content-Type': 'application/json' } };
    return api.post('/api/registrar/', userData, config);
  },
  checkEmail: (correo) => api.get(`/api/verificar-correo/?correo=${encodeURIComponent(correo)}`),
  getCurrentUser: () => api.get('/api/usuarios/me'),
  restablecerContrasena: (correo) => api.post('/usuarios/restablecer-contrasena', { correo }, { headers: { 'Content-Type': 'application/json' } }),
  updateProfile: (userData) => {
    const isFormData = (typeof FormData !== 'undefined') && userData instanceof FormData;
    const config = isFormData ? {} : { headers: { 'Content-Type': 'application/json' } };
    return api.patch('/api/usuarios/me/', userData, config);
  },
  cambiarContrasena: (contrasena_anterior, contrasena_nueva) =>
    api.post('/api/usuarios/cambiar_contrasena/', { contrasena_anterior, contrasena_nueva }, { headers: { 'Content-Type': 'application/json' } }),
  updateUsername: (nombre_usuario) =>
    api.patch('/api/usuarios/cambiar_nombre_usuario/', { nombre_usuario }, { headers: { 'Content-Type': 'application/json' } }),
  deleteAccount: () => api.delete('/api/usuarios/eliminar_cuenta/'),
};

export const donatonService = {
  crearPrenda: (formData) => api.post('/api/prendas/', formData),
  donarRopa: (donacion) => api.post('/api/donaciones', donacion),
  solicitarRopa: (solicitud) => api.post('/api/solicitudes', solicitud),
  getPrendasDisponibles: (skip = 0, limit = 12) => api.get(`/api/prendas/?skip=${skip}&limit=${limit}`),
  getMisSolicitudes: () => api.get('/api/solicitudes/usuario'),
  getMisDonaciones: () => api.get('/api/donaciones/usuario'),
  updatePrenda: (id, formData) => api.patch(`/api/prendas/${id}/`, formData),
  deletePrenda: (id) => api.delete(`/api/prendas/${id}/`),
};

// Admin user management
api.getUserById = (id) => api.get(`/api/usuarios/${id}/`);
api.updateUserById = (id, data) => api.put(`/api/usuarios/${id}/`, data);
api.deleteUserById = (id) => api.delete(`/api/usuarios/${id}/`);

export default api;
