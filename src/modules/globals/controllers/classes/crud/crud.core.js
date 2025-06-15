// @martyrs/src/modules/globals/controllers/classes/crud/crud.core.js

class CRUDCore {
  constructor(crud) {
    this.crud = crud;
    
    // Конфигурация
    this.verifiers = {};
    this.hooks = {};
    this.aggregateExtensions = {};
    this.cacheOptions = {
      ttl: 300, // 5 минут по умолчанию
      tags: [crud.modelName],
      enabled: true
    };
    
    // Auth конфигурация - простая и понятная
    this.auth = {
      read: false,    // Публичный доступ к чтению
      create: true,   // Требует авторизацию
      update: true,   // Требует авторизацию
      delete: true    // Требует авторизацию
    };
    
    // Опции
    this.options = {
      enableEvents: true,
      enableAudit: false,
      enableMetrics: false,
      strictMode: false,
      serviceKey: process.env.SERVICE_KEY
    };
  }

  // Инициализация с опциями
  init(options = {}) {
    // Обработка auth опций
    if (options.auth !== undefined) {
      if (options.auth === false) {
        // Отключаем auth для всех действий
        this.auth = false;
      } else if (options.auth === true) {
        // Включаем auth с дефолтными настройками
        this.auth = {
          read: false,
          create: true,
          update: true,
          delete: true
        };
      } else if (typeof options.auth === 'object') {
        // Мержим с дефолтными настройками
        this.auth = {
          read: false,
          create: true,
          update: true,
          delete: true,
          ...options.auth
        };
      }
    }
    
    // Обработка опций кеша
    if (options.cache !== undefined) {
      if (options.cache === false) {
        this.cacheOptions.enabled = false;
      } else if (typeof options.cache === 'object') {
        this.setCacheOptions(options.cache);
      }
    }
    
    // Обработка опций событий
    if (options.events !== undefined) {
      if (options.events === false) {
        this.options.enableEvents = false;
      } else if (typeof options.events === 'object') {
        Object.assign(this.options, options.events);
      }
    }
    
    // Инициализация из опций
    if (options.verifiers) this.initVerifiers(options.verifiers);
    if (options.hooks) this.initHooks(options.hooks);
    if (options.middlewares) this.initMiddlewares(options.middlewares);
    if (options.aggregateExtensions) this.initAggregateExtensions(options.aggregateExtensions);
    if (options.abac) this.initABAC(options.abac, options.policies, options.fieldsPolicies);
    
    // Сервисный ключ
    if (options.serviceKey !== undefined) {
      this.options.serviceKey = options.serviceKey;
    }
    
    // Инициализация модулей
    this.crud.events.init(this.options);
    if (options.abac) {
      this.crud.policies.init(options.abac, options.policies, options.fieldsPolicies);
    }
  }

  // Управление auth
  setAuth(action, required) {
    if (this.auth === false) {
      this.auth = {};
    }
    this.auth[action] = required;
  }

  getAuth(action) {
    if (this.auth === false) return false;
    return this.auth[action] ?? true;
  }

  isAuthEnabled() {
    return this.auth !== false;
  }
  
  // Управление верификаторами
  setVerifier(action, verifier) {
    this.verifiers[action] = verifier;
  }

  getVerifier(action) {
    return this.verifiers[action];
  }

  initVerifiers(verifiers) {
    Object.entries(verifiers).forEach(([action, verifier]) => {
      this.setVerifier(action, verifier);
    });
  }

  // Управление хуками
  addHook(name, handler) {
    this.hooks[name] = handler;
  }

  getHook(name) {
    return this.hooks[name];
  }

  async executeHook(name, ...args) {
    const hook = this.getHook(name);
    if (hook) {
      return await hook(...args);
    }
  }

  initHooks(hooks) {
    Object.entries(hooks).forEach(([name, handler]) => {
      this.addHook(name, handler);
    });
  }

  // Управление расширениями агрегации
  addAggregateExtension(phase, extension) {
    this.aggregateExtensions[phase] = extension;
  }

  getAggregateExtensions() {
    return this.aggregateExtensions;
  }

  initAggregateExtensions(extensions) {
    Object.entries(extensions).forEach(([phase, extension]) => {
      this.addAggregateExtension(phase, extension);
    });
  }

  // Управление middleware (делегирует в controller)
  initMiddlewares(middlewares) {
    Object.entries(middlewares).forEach(([phase, actions]) => {
      if (typeof actions === 'object') {
        Object.entries(actions).forEach(([action, mws]) => {
          const middlewareArray = Array.isArray(mws) ? mws : [mws];
          middlewareArray.forEach(mw => {
            this.crud.controller.addMiddleware(phase, action, mw);
          });
        });
      }
    });
  }

  // Управление ABAC (делегирует в policies)
  initABAC(abac, policies = {}, fieldsPolicies = null) {
    // Если переданы fieldsPolicies как функция, регистрируем их в ABAC
    if (fieldsPolicies && typeof fieldsPolicies === 'function' && abac) {
      abac.registerFieldsPolicy(this.crud.modelName, fieldsPolicies);
    }
  }

  // Управление кешем
  getCacheOptions() {
    return { ...this.cacheOptions };
  }

  setCacheOptions(options) {
    Object.assign(this.cacheOptions, options);
    // Добавляем modelName в теги если его нет
    if (!this.cacheOptions.tags.includes(this.crud.modelName)) {
      this.cacheOptions.tags.unshift(this.crud.modelName);
    }
  }

  // Получение опций
  getOptions() {
    return { ...this.options };
  }

  setOption(key, value) {
    this.options[key] = value;
  }

  // Проверка включенности функций
  isEventsEnabled() {
    return this.options.enableEvents;
  }

  isCacheEnabled() {
    return this.cacheOptions.enabled && this.crud.cache !== null;
  }

  isAuditEnabled() {
    return this.options.enableAudit;
  }

  isMetricsEnabled() {
    return this.options.enableMetrics;
  }
}

export default CRUDCore;