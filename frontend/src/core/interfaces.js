/**
 * Interfaces para el frontend siguiendo el principio DIP
 * Define los contratos que deben cumplir las implementaciones concretas
 */

/**
 * Interface para servicios de autenticación
 */
export class IAuthService {
  async getCsrf() {
    throw new Error('Method not implemented');
  }

  async login(correo, contrasena) {
    throw new Error('Method not implemented');
  }

  async register(userData) {
    throw new Error('Method not implemented');
  }

  async getCurrentUser() {
    throw new Error('Method not implemented');
  }

  async updateProfile(userData) {
    throw new Error('Method not implemented');
  }

  async changePassword(currentPassword, newPassword) {
    throw new Error('Method not implemented');
  }

  async updateUsername(username) {
    throw new Error('Method not implemented');
  }

  async deleteAccount() {
    throw new Error('Method not implemented');
  }

  async resetPassword(email) {
    throw new Error('Method not implemented');
  }

  async confirmPasswordReset(token, newPassword) {
    throw new Error('Method not implemented');
  }

  async checkEmail(email) {
    throw new Error('Method not implemented');
  }
}

/**
 * Interface para servicios de prendas/donaciones
 */
export class IPrendaService {
  async createPrenda(formData) {
    throw new Error('Method not implemented');
  }

  async getPrenda(id) {
    throw new Error('Method not implemented');
  }

  async getPrendas(params = {}) {
    throw new Error('Method not implemented');
  }

  async getPrendasDisponibles(skip = 0, limit = 12) {
    throw new Error('Method not implemented');
  }

  async getAdminList() {
    throw new Error('Method not implemented');
  }

  async updatePrenda(id, formData) {
    throw new Error('Method not implemented');
  }

  async deletePrenda(id) {
    throw new Error('Method not implemented');
  }

  async incrementarVisitas(id) {
    throw new Error('Method not implemented');
  }
}

/**
 * Interface para servicios de administración
 */
export class IAdminService {
  async getUsuario(id) {
    throw new Error('Method not implemented');
  }

  async getUserById(id) {
    throw new Error('Method not implemented');
  }

  async updateUserById(id, data) {
    throw new Error('Method not implemented');
  }

  async deleteUserById(id) {
    throw new Error('Method not implemented');
  }

  async getAllUsers() {
    throw new Error('Method not implemented');
  }

  async getAllPrendas() {
    throw new Error('Method not implemented');
  }
}

/**
 * Interface para servicios de HTTP/API
 */
export class IHttpService {
  async get(url, config = {}) {
    throw new Error('Method not implemented');
  }

  async post(url, data, config = {}) {
    throw new Error('Method not implemented');
  }

  async put(url, data, config = {}) {
    throw new Error('Method not implemented');
  }

  async patch(url, data, config = {}) {
    throw new Error('Method not implemented');
  }

  async delete(url, config = {}) {
    throw new Error('Method not implemented');
  }
}

/**
 * Interface para validación de datos
 */
export class IValidationService {
  validateEmail(email) {
    throw new Error('Method not implemented');
  }

  validatePassword(password) {
    throw new Error('Method not implemented');
  }

  validateUsername(username) {
    throw new Error('Method not implemented');
  }

  validateFormData(data, rules) {
    throw new Error('Method not implemented');
  }
}

/**
 * Interface para gestión de tokens y autenticación local
 */
export class ITokenService {
  getToken() {
    throw new Error('Method not implemented');
  }

  setToken(token) {
    throw new Error('Method not implemented');
  }

  removeToken() {
    throw new Error('Method not implemented');
  }

  isAuthenticated() {
    throw new Error('Method not implemented');
  }
}

/**
 * Interface para servicios de almacenamiento local
 */
export class IStorageService {
  getItem(key) {
    throw new Error('Method not implemented');
  }

  setItem(key, value) {
    throw new Error('Method not implemented');
  }

  removeItem(key) {
    throw new Error('Method not implemented');
  }

  clear() {
    throw new Error('Method not implemented');
  }
}
