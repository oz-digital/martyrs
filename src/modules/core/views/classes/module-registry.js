// module-registry.js - централизованный регистр модулей
import { ref, readonly } from 'vue';

export class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.loaders = new Map();
    this.initialized = new Map();
    this.dependencies = new Map();
    this.loadingPromises = new Map(); // Для предотвращения дублирования загрузки
  }

  // Регистрация модуля с ленивой загрузкой
  register(name, config) {
    this.loaders.set(name, {
      loader: config.loader,
      routes: config.routes || [],
      dependencies: config.dependencies || [],
      priority: config.priority || 'normal',
      preload: config.preload || false,
      critical: config.critical || false,
    });
  }

  // Загрузка модуля
  async load(name, context = {}) {
    // Если модуль уже загружен
    if (this.modules.has(name)) {
      return this.modules.get(name);
    }

    // Если модуль уже загружается, вернуть существующий промис
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const config = this.loaders.get(name);
    if (!config) {
      throw new Error(`Module ${name} not registered`);
    }

    // Создаем промис загрузки и сохраняем его
    const loadPromise = this._loadModule(name, context, config);
    this.loadingPromises.set(name, loadPromise);

    try {
      const module = await loadPromise;
      this.loadingPromises.delete(name);
      return module;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }

  // Внутренний метод для загрузки модуля
  async _loadModule(name, context, config) {
    const loadStart = Date.now();

    // Загружаем зависимости
    if (config.dependencies.length > 0) {
      await Promise.all(
        config.dependencies.map(dep => this.load(dep, context))
      );
    }

    // Загружаем сам модуль
    const module = await config.loader();
    
    const mod = module.default || module;
    
    this.modules.set(name, mod);
    
    // Инициализируем если есть контекст
    if (context.app && !this.initialized.has(name)) {
      await this.initialize(name, context);
    }

    return mod;
  }

  // Инициализация модуля
  async initialize(name, { app, store, router, config }) {
    const module = this.modules.get(name);
    if (!module || this.initialized.has(name)) {
      return;
    }

    // Инициализируем зависимости
    const moduleConfig = this.loaders.get(name);
    if (moduleConfig.dependencies.length > 0) {
      for (const dep of moduleConfig.dependencies) {
        await this.initialize(dep, { app, store, router, config });
      }
    }

    // Инициализируем модуль
    // Поддерживаем оба варианта: module.initialize и module.default.initialize для обратной совместимости
    const initFunc = module.initialize || (module.default && module.default.initialize);
    if (initFunc) {
      await initFunc(app, store, router, config);
    }
    
    this.initialized.set(name, true);
  }

  // Вспомогательная функция для матчинга Vue Router паттернов
  _matchRoute(pattern, path) {
    // Экранируем спецсимволы и заменяем :param на регулярку
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // экранируем спецсимволы
      .replace(/:\w+/g, '[^/]+');             // :param -> любые символы кроме /

    const regex = new RegExp(`^${regexPattern}(/.*)?$`);
    return regex.test(path);
  }

  // Получить модули для маршрута
  getModulesForRoute(path) {
    const modules = [];

    // Нормализуем путь - убираем trailing slash если это не корень
    const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');

    for (const [name, config] of this.loaders) {
      if (config.routes.some(route => {
        if (typeof route === 'string') {
          // Для корневого роута матчим все пути
          if (route === '/') {
            return true;
          }

          // Если есть параметры (:_id, :slug и т.д.), используем matchRoute
          if (route.includes(':')) {
            return this._matchRoute(route, normalizedPath);
          }

          // Обычная проверка начала пути
          // но учитываем границы сегментов (не /events должен матчить /event)
          const normalizedRoute = route.replace(/\/$/, '');
          return normalizedPath === normalizedRoute ||
                 normalizedPath.startsWith(normalizedRoute + '/');
        }
        if (route instanceof RegExp) {
          return route.test(normalizedPath);
        }
        return false;
      })) {
        modules.push({ name, ...config });
      }
    }

    // Сортируем по приоритету
    return modules.sort((a, b) => {
      const priorities = { critical: 0, high: 1, normal: 2, low: 3 };
      return (priorities[a.priority] || 2) - (priorities[b.priority] || 2);
    });
  }
  
  // Получить критические модули для маршрута (для SSR)
  getCriticalModulesForRoute(path) {
    const allModules = this.getModulesForRoute(path);
    
    // Фильтруем только критические модули и модули с высоким приоритетом
    const criticalModules = allModules.filter(m => 
      m.critical || m.priority === 'critical' || m.priority === 'high'
    );
    
    // Добавляем базовые модули, которые всегда критические
    const baseModules = ['globals', 'auth'];
    const moduleNames = new Set([...baseModules, ...criticalModules.map(m => m.name)]);
    
    // Добавляем зависимости критических модулей
    for (const moduleName of moduleNames) {
      const config = this.loaders.get(moduleName);
      if (config && config.dependencies) {
        for (const dep of config.dependencies) {
          moduleNames.add(dep);
        }
      }
    }
    
    return Array.from(moduleNames);
  }

  // Предзагрузка модулей
  async preloadModules(context) {
    const toPreload = [];
    
    for (const [name, config] of this.loaders) {
      if (config.preload || config.critical) {
        toPreload.push({ name, ...config });
      }
    }

    // Сортируем по приоритету
    toPreload.sort((a, b) => {
      if (a.critical && !b.critical) return -1;
      if (!a.critical && b.critical) return 1;
      const priorities = { critical: 0, high: 1, normal: 2, low: 3 };
      return (priorities[a.priority] || 2) - (priorities[b.priority] || 2);
    });

    // Загружаем критические синхронно
    const critical = toPreload.filter(m => m.critical);
    for (const module of critical) {
      await this.load(module.name, context);
    }

    // Остальные в фоне
    const normal = toPreload.filter(m => !m.critical);
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        normal.forEach(module => this.load(module.name, context));
      });
    } else {
      setTimeout(() => {
        normal.forEach(module => this.load(module.name, context));
      }, 100);
    }
  }

}

// Создаем глобальный регистр
export const moduleRegistry = new ModuleRegistry();

// Утилита для использования в компонентах
export async function useModule(name) {
  return moduleRegistry.load(name);
}

// Composable для Vue
export function useModuleLoader() {
  const loading = ref(false);
  const error = ref(null);

  const loadModule = async (name) => {
    loading.value = true;
    error.value = null;
    
    try {
      const module = await moduleRegistry.load(name);
      return module;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loadModule,
    loading: readonly(loading),
    error: readonly(error),
  };
}