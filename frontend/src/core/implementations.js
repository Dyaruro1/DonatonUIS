/**
 * Concrete implementations for frontend interfaces following DIP
 * Each implementation provides concrete functionality while adhering to interface contracts
 */

import axios from 'axios';
import {
  IAuthService,
  IPrendaService,
  IAdminService,
  IHttpService,
  IValidationService,
  ITokenService,
  IStorageService
} from './interfaces.js';

/**
 * HTTP Service implementation using Axios
 */
export class AxiosHttpService extends IHttpService {
  constructor(baseURL = 'http://localhost:8000', tokenService, storageService) {
    super();
    this.tokenService = tokenService;
    this.storageService = storageService;
    
    this.client = axios.create({
      baseURL,
      withCredentials: true
    });

    this._setupInterceptors();
  }

  _setupInterceptors() {
    // Request interceptor for auth token and CSRF
    this.client.interceptors.request.use(
      (config) => {
        const token = this.tokenService.getToken();
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }

        // Get CSRF token from cookies
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1];
        
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  async patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

/**
 * Token Service implementation using localStorage
 */
export class LocalStorageTokenService extends ITokenService {
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this.tokenKey = 'token';
  }

  getToken() {
    return this.storageService.getItem(this.tokenKey);
  }

  setToken(token) {
    this.storageService.setItem(this.tokenKey, token);
  }

  removeToken() {
    this.storageService.removeItem(this.tokenKey);
  }

  isAuthenticated() {
    const token = this.getToken();
    return token !== null && token !== undefined && token !== '';
  }
}

/**
 * Storage Service implementation using localStorage
 */
export class LocalStorageService extends IStorageService {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

/**
 * Validation Service implementation
 */
export class ValidationService extends IValidationService {
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(email),
      error: emailRegex.test(email) ? null : 'Formato de email inválido'
    };
  }

  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
      errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
    }
    if (!hasUpperCase) {
      errors.push('La contraseña debe tener al menos una letra mayúscula');
    }
    if (!hasLowerCase) {
      errors.push('La contraseña debe tener al menos una letra minúscula');
    }
    if (!hasNumbers) {
      errors.push('La contraseña debe tener al menos un número');
    }
    if (!hasSpecialChar) {
      errors.push('La contraseña debe tener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }

  validateUsername(username) {
    const minLength = 3;
    const maxLength = 30;
    const validCharsRegex = /^[a-zA-Z0-9_-]+$/;

    const errors = [];
    if (username.length < minLength) {
      errors.push(`El nombre de usuario debe tener al menos ${minLength} caracteres`);
    }
    if (username.length > maxLength) {
      errors.push(`El nombre de usuario no puede tener más de ${maxLength} caracteres`);
    }
    if (!validCharsRegex.test(username)) {
      errors.push('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }

  validateFormData(data, rules) {
    const errors = {};
    let isValid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];
      const fieldErrors = [];

      if (fieldRules.required && (!value || value.toString().trim() === '')) {
        fieldErrors.push(`${field} es requerido`);
        isValid = false;
      }

      if (value && fieldRules.minLength && value.toString().length < fieldRules.minLength) {
        fieldErrors.push(`${field} debe tener al menos ${fieldRules.minLength} caracteres`);
        isValid = false;
      }

      if (value && fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
        fieldErrors.push(`${field} no puede tener más de ${fieldRules.maxLength} caracteres`);
        isValid = false;
      }

      if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
        fieldErrors.push(fieldRules.patternMessage || `${field} tiene un formato inválido`);
        isValid = false;
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return { isValid, errors: isValid ? null : errors };
  }
}

/**
 * Authentication Service implementation
 */
export class AuthService extends IAuthService {
  constructor(httpService, tokenService, validationService) {
    super();
    this.httpService = httpService;
    this.tokenService = tokenService;
    this.validationService = validationService;
  }

  async getCsrf() {
    return this.httpService.get('/api/get_csrf/');
  }

  async login(correo, contrasena) {
    // Validate input
    const emailValidation = this.validationService.validateEmail(correo);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    const response = await this.httpService.post('/api/login/', 
      { correo, password: contrasena }, 
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Store token if login successful
    if (response.data && response.data.token) {
      this.tokenService.setToken(response.data.token);
    }

    return response;
  }

  async register(userData) {
    const isFormData = (typeof FormData !== 'undefined') && userData instanceof FormData;
    const config = isFormData ? {} : { headers: { 'Content-Type': 'application/json' } };
    
    return this.httpService.post('/api/registrar/', userData, config);
  }

  async getCurrentUser() {
    return this.httpService.get('/api/usuarios/me');
  }

  async updateProfile(userData) {
    const isFormData = (typeof FormData !== 'undefined') && userData instanceof FormData;
    const config = isFormData ? {} : { headers: { 'Content-Type': 'application/json' } };
    
    return this.httpService.patch('/api/usuarios/me/', userData, config);
  }

  async changePassword(currentPassword, newPassword) {
    // Validate new password
    const passwordValidation = this.validationService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    return this.httpService.post('/api/usuarios/cambiar_contrasena/', 
      { contrasena_anterior: currentPassword, contrasena_nueva: newPassword }, 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async updateUsername(username) {
    // Validate username
    const usernameValidation = this.validationService.validateUsername(username);
    if (!usernameValidation.isValid) {
      throw new Error(usernameValidation.errors.join(', '));
    }

    return this.httpService.patch('/api/usuarios/cambiar_nombre_usuario/', 
      { nombre_usuario: username }, 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async deleteAccount() {
    const response = await this.httpService.delete('/api/usuarios/eliminar_cuenta/');
    // Clear token after successful account deletion
    this.tokenService.removeToken();
    return response;
  }

  async resetPassword(email) {
    const emailValidation = this.validationService.validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    return this.httpService.post('/api/usuarios/solicitar-reset-password/', 
      { correo: email }, 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async confirmPasswordReset(token, newPassword) {
    const passwordValidation = this.validationService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    return this.httpService.post('/api/usuarios/reset-password-confirm/', 
      { token, nueva_contrasena: newPassword }, 
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async checkEmail(email) {
    const emailValidation = this.validationService.validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    return this.httpService.get(`/api/verificar-correo/?correo=${encodeURIComponent(email)}`);
  }
}

/**
 * Prenda/Donation Service implementation
 */
export class PrendaService extends IPrendaService {
  constructor(httpService, validationService) {
    super();
    this.httpService = httpService;
    this.validationService = validationService;
  }

  async createPrenda(formData) {
    return this.httpService.post('/api/prendas/', formData);
  }

  async getPrenda(id) {
    return this.httpService.get(`/api/prendas/${id}/`);
  }

  async getPrendas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/prendas/?${queryString}` : '/api/prendas/';
    return this.httpService.get(url);
  }

  async getPrendasDisponibles(skip = 0, limit = 12) {
    return this.httpService.get(`/api/prendas/?upload_status=Cargado&skip=${skip}&limit=${limit}`);
  }

  async getAdminList() {
    return this.httpService.get('/api/prendas/admin-list/');
  }

  async updatePrenda(id, formData) {
    return this.httpService.patch(`/api/prendas/${id}/`, formData);
  }

  async deletePrenda(id) {
    return this.httpService.delete(`/api/prendas/${id}/`);
  }

  async incrementarVisitas(id) {
    return this.httpService.post(`/api/prendas/${id}/incrementar-visitas/`);
  }
}

/**
 * Admin Service implementation
 */
export class AdminService extends IAdminService {
  constructor(httpService) {
    super();
    this.httpService = httpService;
  }

  async getUsuario(id) {
    return this.httpService.get(`/api/usuarios/${id}/`);
  }

  async getUserById(id) {
    return this.httpService.get(`/api/usuarios/${id}/`);
  }

  async updateUserById(id, data) {
    return this.httpService.put(`/api/usuarios/${id}/`, data);
  }

  async deleteUserById(id) {
    return this.httpService.delete(`/api/usuarios/${id}/`);
  }

  async getAllUsers() {
    return this.httpService.get('/api/usuarios/');
  }

  async getAllPrendas() {
    return this.httpService.get('/api/prendas/');
  }
}
