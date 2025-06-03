/**
 * Dependency Injection Container for Frontend
 * Implements dependency injection pattern with automatic resolution
 */

class DIContainer {
    constructor() {
        this.dependencies = new Map();
        this.singletons = new Map();
    }

    /**
     * Register a dependency with its implementation
     * @param {string} name - The dependency name/key
     * @param {Function} factory - Factory function to create the dependency
     * @param {Object} options - Registration options
     */
    register(name, factory, options = {}) {
        const registration = {
            factory,
            singleton: options.singleton || false,
            dependencies: options.dependencies || []
        };
        this.dependencies.set(name, registration);
    }

    /**
     * Register a singleton dependency
     * @param {string} name - The dependency name/key
     * @param {Function} factory - Factory function to create the dependency
     * @param {Object} options - Registration options
     */
    registerSingleton(name, factory, options = {}) {
        this.register(name, factory, { ...options, singleton: true });
    }

    /**
     * Register an interface with its implementation
     * @param {string} interfaceName - The interface name
     * @param {Function} implementation - The implementation class/function
     * @param {Object} options - Registration options
     */
    registerInterface(interfaceName, implementation, options = {}) {
        this.register(interfaceName, implementation, options);
    }

    /**
     * Resolve a dependency by name
     * @param {string} name - The dependency name to resolve
     * @returns {*} The resolved dependency instance
     */
    resolve(name) {
        const registration = this.dependencies.get(name);
        if (!registration) {
            throw new Error(`Dependency '${name}' not registered`);
        }

        // Return singleton instance if already created
        if (registration.singleton && this.singletons.has(name)) {
            return this.singletons.get(name);
        }

        // Resolve dependencies first
        const resolvedDependencies = registration.dependencies.map(dep => this.resolve(dep));

        // Create instance
        const instance = registration.factory(...resolvedDependencies);

        // Store singleton instance
        if (registration.singleton) {
            this.singletons.set(name, instance);
        }

        return instance;
    }

    /**
     * Check if a dependency is registered
     * @param {string} name - The dependency name
     * @returns {boolean} True if registered
     */
    isRegistered(name) {
        return this.dependencies.has(name);
    }

    /**
     * Get all registered dependency names
     * @returns {string[]} Array of registered dependency names
     */
    getRegisteredNames() {
        return Array.from(this.dependencies.keys());
    }

    /**
     * Clear all registrations and singletons
     */
    clear() {
        this.dependencies.clear();
        this.singletons.clear();
    }

    /**
     * Create a child container that inherits from this container
     * @returns {DIContainer} New child container
     */
    createChild() {
        const child = new DIContainer();
        // Copy parent registrations
        for (const [name, registration] of this.dependencies) {
            child.dependencies.set(name, registration);
        }
        return child;
    }
}

// Global container instance
let globalContainer = null;

/**
 * Get the global container instance
 * @returns {DIContainer} The global container
 */
export function getContainer() {
    if (!globalContainer) {
        globalContainer = new DIContainer();
    }
    return globalContainer;
}

/**
 * Initialize the container with default registrations
 */
export function initializeContainer() {
    const container = getContainer();
    
    // This will be called by the configuration module
    // to register all default implementations
    
    return container;
}

/**
 * Reset the global container (useful for testing)
 */
export function resetContainer() {
    globalContainer = null;
}

export { DIContainer };
export default DIContainer;
