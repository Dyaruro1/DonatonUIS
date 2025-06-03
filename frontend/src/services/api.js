/**
 * Refactored API service following SOLID principles and DIP
 * Uses dependency injection to eliminate tight coupling
 */

import { getAuthService, getPrendaService, getAdminService } from '../core/config.js';

/**
 * Legacy API service for backward compatibility
 * All services are now properly injected and follow DIP
 */
class ApiServiceFacade {
  constructor() {
    this.authService = getAuthService();
    this.prendaService = getPrendaService();
    this.adminService = getAdminService();
  }

  // Legacy getter methods for backward compatibility
  get(url, config = {}) {
    throw new Error('Direct API calls deprecated. Use specific services instead.');
  }

  post(url, data, config = {}) {
    throw new Error('Direct API calls deprecated. Use specific services instead.');
  }

  patch(url, data, config = {}) {
    throw new Error('Direct API calls deprecated. Use specific services instead.');
  }

  delete(url, config = {}) {
    throw new Error('Direct API calls deprecated. Use specific services instead.');
  }

  // Admin methods for backward compatibility
  getUserById(id) {
    return this.adminService.getUserById(id);
  }

  updateUserById(id, data) {
    return this.adminService.updateUserById(id, data);
  }

  deleteUserById(id) {
    return this.adminService.deleteUserById(id);
  }
}

/**
 * Authentication service facade following SRP
 * Delegates to injected AuthService
 */
export const authService = {
  getCsrf: () => getAuthService().getCsrf(),
  login: (correo, contrasena) => getAuthService().login(correo, contrasena),
  register: (userData) => getAuthService().register(userData),
  checkEmail: (correo) => getAuthService().checkEmail(correo),
  getCurrentUser: () => getAuthService().getCurrentUser(),
  restablecerContrasena: (correo) => getAuthService().resetPassword(correo),
  updateProfile: (userData) => getAuthService().updateProfile(userData),
  cambiarContrasena: (contrasena_anterior, contrasena_nueva) => 
    getAuthService().changePassword(contrasena_anterior, contrasena_nueva),
  updateUsername: (nombre_usuario) => getAuthService().updateUsername(nombre_usuario),
  deleteAccount: () => getAuthService().deleteAccount(),
  solicitarResetPassword: (correo) => getAuthService().resetPassword(correo),
  cambiarContrasenaConToken: (token, nueva_contrasena) => 
    getAuthService().confirmPasswordReset(token, nueva_contrasena),
  sincronizarContrasenaSupabase: (correo, nueva_contrasena) => {
    // TODO: This method needs to be implemented in the backend service
    console.warn('sincronizarContrasenaSupabase: Method needs backend implementation');
    return getAuthService().changePassword('', nueva_contrasena);
  }
};

/**
 * Donation/Prenda service facade following SRP
 * Delegates to injected PrendaService
 */
export const donatonService = {
  crearPrenda: (formData) => getPrendaService().createPrenda(formData),
  donarRopa: (donacion) => {
    // TODO: This method needs proper implementation
    console.warn('donarRopa: Method needs proper implementation');
    throw new Error('Method not implemented yet');
  },
  solicitarRopa: (solicitud) => {
    // TODO: This method needs proper implementation
    console.warn('solicitarRopa: Method needs proper implementation');
    throw new Error('Method not implemented yet');
  },
  getPrendasDisponibles: (skip = 0, limit = 12) => 
    getPrendaService().getPrendasDisponibles(skip, limit),
  getMisSolicitudes: () => {
    // TODO: This method needs proper implementation
    console.warn('getMisSolicitudes: Method needs proper implementation');
    throw new Error('Method not implemented yet');
  },
  getMisDonaciones: () => {
    // TODO: This method needs proper implementation
    console.warn('getMisDonaciones: Method needs proper implementation');
    throw new Error('Method not implemented yet');
  },
  updatePrenda: (id, formData) => getPrendaService().updatePrenda(id, formData),
  deletePrenda: (id) => getPrendaService().deletePrenda(id),
  incrementarVisitas: (id) => getPrendaService().incrementarVisitas(id)
};

/**
 * Profile service function for backward compatibility
 * Uses injected AuthService
 */
export const getProfileWithToken = () => getAuthService().getCurrentUser();

// Create singleton instance for backward compatibility
const api = new ApiServiceFacade();

export default api;
