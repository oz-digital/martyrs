// @martyrs/src/modules/globals/controllers/classes/globals.abac.js
import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';

import ABACCore from './abac/abac.core.js';
import ABACPolicies from './abac/abac.policies.js';
import ABACFields from './abac/abac.fields.js';

import ABACExpressAdapter from './abac/abac.adapter.express.js';
import ABACWebSocketAdapter from './abac/abac.adapter.ws.js';

/**
 * @typedef {Object} ABACOptions
 * @property {boolean} [strictMode=false] - Строгий режим (undefined = deny)
 * @property {boolean} [defaultDeny=false] - Запрет по умолчанию
 * @property {string} [serviceKey] - Ключ для сервисных запросов
 * @property {boolean} [enableAudit=true] - Включить аудит
 * @property {boolean} [cacheEnabled=true] - Включить кэширование
 * @property {number} [cacheTTL=300] - TTL кэша в секундах
 * @property {number} [concurrencyLimit=10] - Лимит параллельных политик
 * @property {Object} [logger] - Кастомный логгер
 */

/**
 * @typedef {Object} ABACContext
 * @property {string|null} user - ID пользователя
 * @property {string} action - Действие (read, create, update, delete, etc)
 * @property {string} resource - Тип ресурса
 * @property {Object} [currentResource] - Загруженный ресурс
 * @property {string} [resourceId] - ID ресурса
 * @property {Object} data - Данные запроса
 * @property {Object} [data.body] - Body запроса (Express)
 * @property {Object} [data.query] - Query параметры (Express)
 * @property {Object} [data.params] - Route параметры (Express)
 * @property {Object} [req] - Express request
 * @property {Object} [socket] - WebSocket соединение
 * @property {Object} [params] - Route параметры
 * @property {boolean} [skipFieldPolicies=false] - Пропустить проверку полей
 * @property {Object} [options] - Дополнительные опции
 */

/**
 * @typedef {Object} ABACResult
 * @property {boolean} allow - Разрешен ли доступ
 * @property {string} reason - Причина решения
 * @property {Array} [policies] - Примененные политики
 */

/**
 * @typedef {Object} FieldsResult
 * @property {Object} allowed - Разрешенные данные
 * @property {Array} denied - Запрещенные поля
 * @property {Array} errors - Ошибки валидации
 * @property {Object} transformed - Трансформированные данные
 */

class GlobalABAC {
  constructor(db, options = {}) {
    this.db = db;
    
    /** @type {ABACOptions} */
    this.options = {
      strictMode: false,
      defaultDeny: false,
      serviceKey: process.env.SERVICE_KEY,
      enableAudit: true,
      cacheEnabled: true,
      cacheTTL: 300,
      concurrencyLimit: 10,
      ...options,
    };
    
    // Инициализация компонентов
    this.cache = new Cache({ ttlSeconds: this.options.cacheTTL });
    this.logger = this.options.logger || new Logger(db);
    
    // Инициализация модулей
    this.core = new ABACCore(this);
    this.policies = new ABACPolicies(this);
    this.fields = new ABACFields(this);
    this.express = new ABACExpressAdapter(this);
    this.websocket = new ABACWebSocketAdapter(this);
  }

  /**
   * Регистрация глобальной политики
   * @param {string} name - Имя политики
   * @param {Function} policyFn - Функция политики (context) => boolean|{allow, force, reason}
   * @param {Object} [metadata] - Метаданные политики
   * @param {string} [metadata.type='dynamic'] - Тип (static|dynamic)
   * @param {number} [metadata.priority=0] - Приоритет
   * @returns {GlobalABAC}
   */
  registerGlobalPolicy(name, policyFn, metadata = {}) {
    return this.policies.registerGlobalPolicy(name, policyFn, metadata);
  }

  /**
   * Регистрация политики для ресурса
   * @param {string} resourceName - Имя ресурса
   * @param {Function} policyFn - Функция политики
   * @param {Object} [options] - Опции
   * @param {string} [options.modelName] - Имя модели в БД
   * @returns {GlobalABAC}
   */
  registerResourcePolicy(resourceName, policyFn, options = {}) {
    return this.policies.registerResourcePolicy(resourceName, policyFn, options);
  }

  /**
   * Регистрация политики полей
   * @param {string} resourceName - Имя ресурса
   * @param {Object} config - Конфигурация полей
   * @returns {GlobalABAC}
   * 
   * @example
   * abac.registerFieldsPolicy('user', {
   *   'email': { access: 'deny', actions: ['update'] },
   *   'password': { access: 'deny', actions: '*', rule: 'remove' },
   *   'profile.*': { 
   *     access: async (ctx) => ctx.user === ctx.currentResource?.id,
   *     transform: (value) => sanitize(value)
   *   }
   * });
   */
  registerFieldsPolicy(resourceName, config) {
    return this.fields.registerFieldsPolicy(resourceName, config);
  }

  /**
   * Регистрация расширения контекста
   * @param {string} moduleName - Имя модуля
   * @param {Function} extensionFn - Функция расширения (context) => void
   * @returns {GlobalABAC}
   */
  registerExtension(moduleName, extensionFn) {
    return this.policies.registerExtension(moduleName, extensionFn);
  }

  /**
   * Проверка доступа
   * @param {ABACContext|Object} context - Контекст проверки
   * @param {Object} [customPolicies] - Дополнительные политики
   * @returns {Promise<ABACResult>}
   */
  async checkAccess(context, customPolicies = {}) {
    return this.core.checkAccess(context, customPolicies);
  }

  /**
   * Проверка доступа к полям
   * @param {ABACContext|Object} context - Контекст
   * @param {Object} data - Данные для проверки
   * @param {string} [action] - Действие
   * @returns {Promise<FieldsResult>}
   */
  async checkFields(context, data, action = null) {
    return this.fields.checkFields(context, data, action);
  }

  /**
   * Проверка конкретных политик
   * @param {ABACContext|Object} context - Контекст
   * @param {string[]} policyNames - Имена политик
   * @param {Object} [customPolicies] - Дополнительные политики
   * @returns {Promise<ABACResult>}
   */
  async checkPolicies(context, policyNames = [], customPolicies = {}) {
    return this.policies.checkPolicies(context, policyNames, customPolicies);
  }

  /**
   * Express middleware для проверки доступа
   * @param {string} resource - Ресурс
   * @param {string} action - Действие
   * @param {Object} [options] - Опции
   * @returns {Function|Function[]} Middleware функция(и)
   */
  middleware(resource, action, options = {}) {
    return this.express.middleware(resource, action, options);
  }

  /**
   * Express middleware для проверки политик
   * @param {string[]} policyNames - Имена политик
   * @param {Object} [customPolicies] - Дополнительные политики
   * @param {Object} [options] - Опции
   * @returns {Function} Middleware функция
   */
  policyMiddleware(policyNames = [], customPolicies = {}, options = {}) {
    return this.express.policyMiddleware(policyNames, customPolicies, options);
  }

  /**
   * Express middleware для проверки полей
   * @param {string} resource - Ресурс
   * @param {Object} [options] - Опции
   * @returns {Function} Middleware функция
   */
  fieldsMiddleware(resource, options = {}) {
    return this.express.fieldsMiddleware(resource, options);
  }

  /**
   * WebSocket handler
   * @param {string} moduleName - Имя модуля
   * @param {Object} [options] - Опции
   * @returns {Function} Handler функция
   */
  wsHandler(moduleName, options = {}) {
    return this.websocket.handler(moduleName, options);
  }
  
  /**
   * Получение модели ресурса из БД
   * @param {string} resourceName - Имя ресурса
   * @returns {Object|null} Mongoose модель или null
   */
  getResourceModel(resourceName) {
    const resourcePolicy = this.policies.resources.get(resourceName);
    if (!resourcePolicy) return null;
    
    const modelName = resourcePolicy.modelName || resourceName;
    return this.db[modelName] || null;
  }

  /**
   * Очистка кэша
   * @param {Object} [options] - Опции очистки
   * @param {string} [options.user] - Очистить для пользователя
   * @param {string} [options.resource] - Очистить для ресурса
   * @param {string} [options.policy] - Очистить для политики
   */
  async clearCache(options = {}) {
    if (options.user) {
      await this.cache.invalidateTag(`user_${options.user}`);
    }
    if (options.resource) {
      await this.cache.invalidateTag(`resource_${options.resource}`);
    }
    if (options.policy) {
      await this.cache.invalidateTag(`policy_${options.policy}`);
    }
    if (!options.user && !options.resource && !options.policy) {
      await this.cache.clear();
    }
  }

  /**
   * Получение статистики
   * @returns {Object} Статистика системы
   */
  getStats() {
    return {
      policies: {
        global: this.policies.global.size,
        resources: this.policies.resources.size,
        extensions: this.policies.extensions.size
      },
      fields: {
        configs: this.fields.configs.size
      },
      cache: {
        size: this.cache.size,
        hits: this.cache.hits,
        misses: this.cache.misses
      }
    };
  }
}

// Экспорт синглтона
let instance = null;

/**
 * Получение экземпляра ABAC
 * @param {Object} db - База данных
 * @param {ABACOptions} [options] - Опции
 * @returns {GlobalABAC}
 */
export const getInstance = (db, options) => {
  if (!instance) {
    instance = new GlobalABAC(db, options);
  }
  return instance;
};

/**
 * Сброс экземпляра (для тестов)
 */
export const resetInstance = () => {
  instance = null;
};

export default { getInstance, resetInstance };