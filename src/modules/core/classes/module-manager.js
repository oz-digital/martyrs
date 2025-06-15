export const createModuleManager = () => {
  const modules = new Map();
  const plugins = new Map();
  const events = createEventBus();

  const manager = {
    registerModule(module) {
      if (!module?.name) {
        throw new Error('Invalid module object');
      }

      if (modules.has(module.name)) {
        throw new Error(`Module ${module.name} is already registered`);
      }

      modules.set(module.name, module);
      events.emit('moduleRegistered', module);
    },

    unregisterModule(name) {
      const module = modules.get(name);

      if (module) {
        module.destroy();
        modules.delete(name);
        plugins.delete(name);
        events.emit('moduleUnregistered', name);
      }
    },

    _detectCircularDependencies(moduleName, visited = new Set()) {
      if (visited.has(moduleName)) {
        throw new Error(`Circular dependency detected for module ${moduleName}`);
      }

      visited.add(moduleName);

      const module = modules.get(moduleName);

      for (const dep of module.requires) {
        this._detectCircularDependencies(dep, new Set(visited));
      }
    },

    async initialize(app, store, router, options = {}) {
      try {
        // Check for circular dependencies
        for (const module of modules.values()) {
          this._detectCircularDependencies(module.name);
        }

        const sortedModules = this._sortModulesByDependencies();

        // Initialize modules sequentially to maintain dependency order
        for (const module of sortedModules) {
          const moduleOptions = options[module.name] || {};

          try {
            await module.initialize(app, store, router, moduleOptions);

            // Initialize plugins
            if (plugins.has(module.name)) {
              await Promise.all(Array.from(plugins.get(module.name)).map(plugin => plugin.initialize(app, store, router, moduleOptions)));
            }
          } catch (error) {
            throw new Error(`Failed to initialize module ${module.name}: ${error.message}`);
          }
        }
      } catch (error) {
        // Cleanup on initialization failure
        this.destroy();
        throw error;
      }
    },

    // Proper cleanup
    destroy() {
      for (const module of modules.values()) {
        module.destroy();
      }
      modules.clear();
      plugins.clear();
      events.destroy();
    },
  };

  return manager;
};
