/**
 * Application initialization for Dependency Injection
 * This should be imported early in the application lifecycle
 */

import { configureContainer } from './core/config.js';

/**
 * Initialize the application with dependency injection
 * Call this function once when the app starts (e.g., in main.jsx or App.jsx)
 */
export function initializeApp() {
  // Configure the DI container with all services
  const container = configureContainer();
  
  console.log('✅ Dependency Injection container initialized');
  console.log('📦 Registered services:', container.getRegisteredNames());
  
  return container;
}

/**
 * For development: Log registered services
 */
export function logRegisteredServices() {
  const container = configureContainer();
  console.table(container.getRegisteredNames().map(name => ({ service: name })));
}

export default initializeApp;
