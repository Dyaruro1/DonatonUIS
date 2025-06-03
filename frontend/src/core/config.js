/**
 * Configuration module for Dependency Injection Container
 * Registers all services and their dependencies automatically
 */

import { getContainer } from './container.js';
import {
  AxiosHttpService,
  LocalStorageTokenService,
  LocalStorageService,
  ValidationService,
  AuthService,
  PrendaService,
  AdminService
} from './implementations.js';

/**
 * Configure and initialize the DI container with all services
 */
export function configureContainer() {
  const container = getContainer();

  // Register core services first (no dependencies)
  container.registerSingleton('IStorageService', () => new LocalStorageService());
  container.registerSingleton('IValidationService', () => new ValidationService());

  // Register services with dependencies
  container.registerSingleton('ITokenService', (storageService) => 
    new LocalStorageTokenService(storageService), 
    { dependencies: ['IStorageService'] }
  );

  container.registerSingleton('IHttpService', (tokenService, storageService) => 
    new AxiosHttpService('http://localhost:8000', tokenService, storageService),
    { dependencies: ['ITokenService', 'IStorageService'] }
  );

  container.registerSingleton('IAuthService', (httpService, tokenService, validationService) => 
    new AuthService(httpService, tokenService, validationService),
    { dependencies: ['IHttpService', 'ITokenService', 'IValidationService'] }
  );

  container.registerSingleton('IPrendaService', (httpService, validationService) => 
    new PrendaService(httpService, validationService),
    { dependencies: ['IHttpService', 'IValidationService'] }
  );

  container.registerSingleton('IAdminService', (httpService) => 
    new AdminService(httpService),
    { dependencies: ['IHttpService'] }
  );

  return container;
}

/**
 * Initialize the container and return configured services
 * This is the main entry point for getting services
 */
export function initializeServices() {
  const container = configureContainer();
  
  return {
    authService: container.resolve('IAuthService'),
    prendaService: container.resolve('IPrendaService'),
    adminService: container.resolve('IAdminService'),
    httpService: container.resolve('IHttpService'),
    tokenService: container.resolve('ITokenService'),
    storageService: container.resolve('IStorageService'),
    validationService: container.resolve('IValidationService')
  };
}

/**
 * Get a specific service from the container
 * @param {string} serviceName - The service interface name
 * @returns {*} The service instance
 */
export function getService(serviceName) {
  const container = getContainer();
  
  // Configure container if not already configured
  if (!container.isRegistered(serviceName)) {
    configureContainer();
  }
  
  return container.resolve(serviceName);
}

// Export individual service getters for convenience
export function getAuthService() {
  return getService('IAuthService');
}

export function getPrendaService() {
  return getService('IPrendaService');
}

export function getAdminService() {
  return getService('IAdminService');
}

export function getHttpService() {
  return getService('IHttpService');
}

export function getTokenService() {
  return getService('ITokenService');
}

export function getStorageService() {
  return getService('IStorageService');
}

export function getValidationService() {
  return getService('IValidationService');
}
