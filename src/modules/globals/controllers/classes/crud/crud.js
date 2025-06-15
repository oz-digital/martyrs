// @martyrs/src/modules/globals/controllers/classes/crud/crud.js
import CRUDCore from './crud.core.js';
import CRUDController from './crud.controller.js';
import CRUDService from './crud.service.js';
import CRUDPolicies from './crud.policies.js';
import CRUDEvents from './crud.events.js';
import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';

/**
 * CRUD класс для создания REST API с поддержкой ABAC, кеширования и событий
 * 
 * Архитектура:
 * - core: базовая конфигурация и инициализация
 * - service: CRUD операции (create, read, update, delete) - переиспользуемые
 * - controller: регистрация роутов Express
 * - policies: ABAC интеграция
 * - events: Observer pattern для событий
 */

class CRUD {
  constructor(options = {}) {
    const {
      app,
      db,
      model,
      basePath,
      modelName = model?.modelName || 'resource',
      cache,
      logger,
      ...otherOptions
    } = options;

    // Базовые свойства
    this.app = app;
    this.db = db;
    this.model = model;
    this.basePath = basePath;
    this.modelName = modelName;
    
    // Инициализация сервисов
    this.cache = cache !== false ? (cache instanceof Cache ? cache : new Cache()) : null;
    this.logger = logger || new Logger(db);
    
    // Инициализация модулей
    this.initModules(otherOptions);
    
    // Конфигурация
    this.core.init(otherOptions);
    
    // Регистрация дефолтных роутов
    if (!otherOptions.disableDefaultRoutes) {
      this.registerDefaultRoutes();
    }
  }

  initModules(options) {
    // Core для базовой конфигурации
    this.core = new CRUDCore(this);
    
    // Service для бизнес-логики CRUD операций
    this.service = new CRUDService(this);
    
    // Controller для управления роутами
    this.controller = new CRUDController(this);
    
    // Policies для ABAC
    this.policies = new CRUDPolicies(this);
    
    // Events для событий
    this.events = new CRUDEvents(this);
  }

  // Регистрация дефолтных CRUD роутов
  registerDefaultRoutes() {
    this.controller.registerRoute('post', '/create', 'create');
    this.controller.registerRoute('get', '/read', 'read');
    this.controller.registerRoute('put', '/update', 'update');
    this.controller.registerRoute('delete', '/delete', 'delete');
  }

  // API методы для конфигурации
  setVerifier(action, verifier) {
    this.core.setVerifier(action, verifier);
    return this;
  }

  addHook(name, handler) {
    this.core.addHook(name, handler);
    return this;
  }

  addMiddleware(phase, action, middleware) {
    this.controller.addMiddleware(phase, action, middleware);
    return this;
  }

  addAbac(action, options = {}) {
    this.policies.setOptions(action, options);
    return this;
  }

  addAggregateExtension(phase, extension) {
    this.core.addAggregateExtension(phase, extension);
    return this;
  }

  // Управление авторизацией
  setAuth(action, required) {
    this.core.setAuth(action, required);
    return this;
  }

  // Добавление кастомного действия
  addAction(name, config) {
    const {
      method = 'post',
      path = `/${name}`,
      handler,
      verifier,
      middlewares = { before: [], after: [] },
      abac = {},
      hooks = {},
      auth = true // По умолчанию требует авторизацию
    } = config;

    // Добавляем конфигурацию
    if (verifier) this.setVerifier(name, verifier);
    if (abac) this.addAbac(name, abac);
    if (auth !== undefined) this.setAuth(name, auth);
    
    // Добавляем middleware
    if (middlewares.before) {
      const beforeMiddlewares = Array.isArray(middlewares.before) ? middlewares.before : [middlewares.before];
      beforeMiddlewares.forEach(mw => this.addMiddleware('before', name, mw));
    }
    if (middlewares.after) {
      const afterMiddlewares = Array.isArray(middlewares.after) ? middlewares.after : [middlewares.after];
      afterMiddlewares.forEach(mw => this.addMiddleware('after', name, mw));
    }

    // Добавляем хуки
    Object.entries(hooks).forEach(([hookName, hookFn]) => {
      this.addHook(hookName, hookFn);
    });

    // Регистрируем роут с кастомным handler
    if (handler) {
      this.controller.registerCustomRoute(method, path, name, handler);
    } else {
      this.controller.registerRoute(method, path, name);
    }
    
    return this;
  }

  // Получение конфигурации кеша
  getCacheOptions() {
    return this.core.getCacheOptions();
  }

  // Установка опций кеша
  setCacheOptions(options) {
    this.core.setCacheOptions(options);
    return this;
  }
}

export default CRUD;