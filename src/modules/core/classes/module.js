export const createModule = ({
  name,
  version,
  requires = [],
  framework = 'vue', // Support for different frameworks
}) => {
  if (!name) throw new Error('Module name is required');
  if (!version) throw new Error('Module version is required');

  // Private fields with WeakMap for better garbage collection
  const stores = new WeakMap();
  const routes = new WeakMap();
  const components = new WeakMap();
  const hooks = new WeakMap();
  const events = createEventBus();

  let isInitialized = false;

  // Validate component name uniqueness
  const validateComponentName = name => {
    if (components.has(name)) {
      throw new Error(`Component ${name} already registered`);
    }
  };

  const module = {
    name,
    version,
    requires,
    events,

    addComponent(name, component, options = {}) {
      validateComponentName(name);

      const { async = false } = options;

      components.set(name, {
        component,
        async,
        framework,
      });
    },

    // Add proper cleanup
    destroy() {
      stores.clear();
      routes.clear();
      components.clear();
      hooks.clear();
      events.destroy();
      isInitialized = false;
    },

    async initialize(app, store, router, options = {}) {
      if (isInitialized) {
        throw new Error(`Module ${name} is already initialized`);
      }

      try {
        await this._runHooks('beforeInit', { app, store, router });

        // Initialize features with error handling
        await Promise.all([this._initializeComponents(app, options), this._initializeStores(store, options), this._initializeRoutes(router, options)]);

        await this._runHooks('init', { app, store, router });
        await this._runHooks('afterInit', { app, store, router });

        isInitialized = true;
      } catch (error) {
        // Cleanup on initialization failure
        this.destroy();
        throw new Error(`Failed to initialize module ${name}: ${error.message}`);
      }
    },

    // Private methods with proper error handling
    async _initializeComponents(app, options) {
      const usedFeatures = options.use || [];

      for (const [name, { component, async, framework }] of components) {
        if (!usedFeatures.length || usedFeatures.includes(name)) {
          try {
            if (framework === 'vue') {
              if (async) {
                app.component(
                  name,
                  defineAsyncComponent(() => component)
                );
              } else {
                app.component(name, component);
              }
            } else {
              // Support for other frameworks
              throw new Error(`Framework ${framework} not supported`);
            }
          } catch (error) {
            throw new Error(`Failed to register component ${name}: ${error.message}`);
          }
        }
      }
    },
  };

  return module;
};
