/**
 * Refactored API Service following SOLID principles
 * This service acts as a facade that uses dependency injection
 * 
 * SOLID Principles Applied:
 * - SRP: Each service has a single responsibility
 * - OCP: Services can be extended without modification
 * - LSP: All implementations follow their interface contracts
 * - ISP: Interfaces are specific and focused
 * - DIP: Depends on abstractions, not concretions
 */

import { 
  getAuthService, 
  getPrendaService, 
  getAdminService,
  getHttpService 
} from '../core/config.js';

/**
 * Legacy API compatibility layer
 * Provides the same interface as the old api.js but uses DI internally
 */
class APIService {
  constructor() {
    // Services are resolved lazily to avoid circular dependencies
    this._authService = null;
    this._prendaService = null;
    this._adminService = null;
    this._httpService = null;
  }

  get authService() {
    if (!this._authService) {
      this._authService = getAuthService();
    }
    return this._authService;
  }

  get prendaService() {
    if (!this._prendaService) {
      this._prendaService = getPrendaService();
    }
    return this._prendaService;
  }

  get adminService() {
    if (!this._adminService) {
      this._adminService = getAdminService();
    }
    return this._adminService;
  }

  get httpService() {
    if (!this._httpService) {
      this._httpService = getHttpService();
    }
    return this._httpService;
  }
}

// Create singleton instance
const apiService = new APIService();

// Export legacy-compatible auth service
export const authService = {
  getCsrf: () => apiService.authService.getCsrf(),
  login: (correo, contrasena) => apiService.authService.login(correo, contrasena),
  register: (userData) => apiService.authService.register(userData),
  checkEmail: (correo) => apiService.authService.checkEmail(correo),
  getCurrentUser: () => apiService.authService.getCurrentUser(),
  restablecerContrasena: (correo) => apiService.authService.resetPassword(correo),
  updateProfile: (userData) => apiService.authService.updateProfile(userData),
  cambiarContrasena: (contrasena_anterior, contrasena_nueva) => 
    apiService.authService.changePassword(contrasena_anterior, contrasena_nueva),
  updateUsername: (nombre_usuario) => apiService.authService.updateUsername(nombre_usuario),
  deleteAccount: () => apiService.authService.deleteAccount(),
  solicitarResetPassword: (correo) => apiService.authService.resetPassword(correo),
  cambiarContrasenaConToken: (token, nueva_contrasena) => 
    apiService.authService.confirmPasswordReset(token, nueva_contrasena),
  sincronizarContrasenaSupabase: (correo, nueva_contrasena) => {
    // This would need to be implemented in the backend and then in AuthService
    // For now, delegate to the HTTP service directly
    return apiService.httpService.post('/api/sincronizar-contrasena-supabase/', 
      { correo, nueva_contrasena }, 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Export legacy-compatible donaton service
export const donatonService = {
  crearPrenda: (formData) => apiService.prendaService.createPrenda(formData),
  donarRopa: (donacion) => {
    // This endpoint doesn't exist in the new service, delegate to HTTP service
    return apiService.httpService.post('/api/donaciones', donacion);
  },
  solicitarRopa: (solicitud) => {
    // This endpoint doesn't exist in the new service, delegate to HTTP service
    return apiService.httpService.post('/api/solicitudes', solicitud);
  },
  getPrendasDisponibles: (skip = 0, limit = 12) => 
    apiService.prendaService.getPrendasDisponibles(skip, limit),
  getMisSolicitudes: () => {
    // This endpoint doesn't exist in the new service, delegate to HTTP service
    return apiService.httpService.get('/api/solicitudes/usuario');
  },
  getMisDonaciones: () => {
    // This endpoint doesn't exist in the new service, delegate to HTTP service
    return apiService.httpService.get('/api/donaciones/usuario');
  },
  updatePrenda: (id, formData) => apiService.prendaService.updatePrenda(id, formData),
  deletePrenda: (id) => apiService.prendaService.deletePrenda(id),
  incrementarVisitas: (id) => apiService.prendaService.incrementarVisitas(id)
};

// Create a legacy-compatible API object
const api = {
  // Admin methods
  getUserById: (id) => apiService.adminService.getUserById(id),
  updateUserById: (id, data) => apiService.adminService.updateUserById(id, data),
  deleteUserById: (id) => apiService.adminService.deleteUserById(id),
  
  // Direct HTTP methods for backward compatibility
  get: (url, config) => apiService.httpService.get(url, config),
  post: (url, data, config) => apiService.httpService.post(url, data, config),
  put: (url, data, config) => apiService.httpService.put(url, data, config),
  patch: (url, data, config) => apiService.httpService.patch(url, data, config),
  delete: (url, config) => apiService.httpService.delete(url, config)
};

// Export profile function with token
export const getProfileWithToken = () => apiService.httpService.get('/api/usuarios/perfil/');

// Export the new service-oriented API
export { 
  getAuthService, 
  getPrendaService, 
  getAdminService,
  getHttpService 
} from '../core/config.js';

export default api;
