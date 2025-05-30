import axios from 'axios';

// Configuración base de axios
const API_URL = 'http://localhost:8000'; // URL de tu backend Django

const api = axios.create({
  baseURL: API_URL,
  // No pongas headers aquí, axios los gestiona por request
});

// Interceptor para añadir token de autenticación si existe y configurar CSRF
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    // Asegurar que withCredentials se establece para todas las solicitudes relevantes
    config.withCredentials = true;

    // Obtener el token CSRF de las cookies
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Funciones para interactuar con el API
export const authService = {
  getCsrf: () => api.get('/api/get_csrf/'), // <--- ADDED THIS LINE
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
  restablecerContrasena: (correo) => api.post('/api/usuarios/restablecer_contrasena/', { correo }, { headers: { 'Content-Type': 'application/json' } }),
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
  solicitarResetPassword: (correo) => api.post('/api/usuarios/solicitar-reset-password/', { correo }, { headers: { 'Content-Type': 'application/json' } }),  cambiarContrasenaConToken: (token, nueva_contrasena) => api.post('/api/usuarios/reset-password-confirm/', { token, nueva_contrasena }, { headers: { 'Content-Type': 'application/json' } }),
  // Nuevo método para sincronizar la contraseña con el backend
  sincronizarContrasenaSupabase: (correo, nueva_contrasena) =>
    api.post('/api/sincronizar-contrasena-supabase/', { correo, nueva_contrasena }, { headers: { 'Content-Type': 'application/json' } }),
};

export const donatonService = {
  crearPrenda: (formData) => api.post('/api/prendas/', formData),
  donarRopa: (donacion) => api.post('/api/donaciones', donacion),
  solicitarRopa: (solicitud) => api.post('/api/solicitudes', solicitud),
  getPrendasDisponibles: (skip = 0, limit = 12) => api.get(`/api/prendas/?upload_status=Cargado&skip=${skip}&limit=${limit}`),
  getMisSolicitudes: () => api.get('/api/solicitudes/usuario'),
  getMisDonaciones: () => api.get('/api/donaciones/usuario'),
  updatePrenda: (id, formData) => api.patch(`/api/prendas/${id}/`, formData),
  deletePrenda: (id) => api.delete(`/api/prendas/${id}/`),
  incrementarVisitas: (id) => api.post(`/api/prendas/${id}/incrementar-visitas/`),
};

// Admin user management
api.getUserById = (id) => api.get(`/api/usuarios/${id}/`);
api.updateUserById = (id, data) => api.put(`/api/usuarios/${id}/`, data);
api.deleteUserById = (id) => api.delete(`/api/usuarios/${id}/`);

// Función para obtener el perfil del usuario autenticado usando el token
export const getProfileWithToken = () => api.get('/api/usuarios/perfil/');

export default api;
