// @martyrs/src/modules/core/controllers/classes/core.abac.js
import Cache from '@martyrs/src/modules/core/controllers/classes/core.cache.js';
import Logger from '@martyrs/src/modules/core/controllers/classes/core.logger.js';

import ABACCore from './abac.core.js';
import ABACPolicies from './abac.policies.js';
import ABACFields from './abac.fields.js';

import ABACExpressAdapter from './abac.adapter.express.js';
import ABACWebSocketAdapter from './abac.adapter.ws.js';

class GlobalABAC {
  constructor(db, options = {}) {
    this.db = db;
    this.options = {
      strictMode: false,
      defaultDeny: false,
      serviceKey: process.env.SERVICE_KEY,
      enableAudit: true,
      cacheEnabled: true,
      cacheTTL: 300, // 5 минут
      concurrencyLimit: 10,
      ...options,
    };
    
    // Инициализация компонентов
    this.cache = new Cache({ ttlSeconds: this.options.cacheTTL });
    this.logger = options.auditLogger || new Logger(db);
    
    // Инициализация модулей
    this.core = new ABACCore(this);
    this.policies = new ABACPolicies(this);
    this.fields = new ABACFields(this);
    this.express = new ABACExpressAdapter(this);
    this.websocket = new ABACWebSocketAdapter(this);
  }

  // API методы для регистрации политик
  registerGlobalPolicy(name, policyFn, metadata = {}) {
    return this.policies.registerGlobalPolicy(name, policyFn, metadata);
  }

  registerResourcePolicy(resourceName, policyFn, options = {}) {
    return this.policies.registerResourcePolicy(resourceName, policyFn, options);
  }

  registerFieldsPolicy(resourceName, builderFn) {
    return this.fields.registerFieldsPolicy(resourceName, builderFn);
  }

  registerExtension(moduleName, extensionFn) {
    return this.policies.registerExtension(moduleName, extensionFn);
  }

  // Основные методы проверки
  async checkAccess(context, customPolicies = {}) {
    return this.core.checkAccess(context, customPolicies);
  }

  async checkFields(context, data, action = null, isQuery = false) {
    return this.fields.checkFields(context, data, action, isQuery);
  }

  async checkPolicies(context, policyNames = [], customPolicies = {}) {
    return this.policies.checkPolicies(context, policyNames, customPolicies);
  }

  // Адаптеры
  middleware(resource, action, options = {}) {
    return this.express.middleware(resource, action, options);
  }

  policyMiddleware(policyNames = [], customPolicies = {}, options = {}) {
    return this.express.policyMiddleware(policyNames, customPolicies, options);
  }

  fieldsMiddleware(resource, options = {}) {
    return this.express.fieldsMiddleware(resource, options);
  }

  wsHandler(moduleName, options = {}) {
    return this.websocket.handler(moduleName, options);
  }
  
  getResourceModel(resourceName) {
    const resourcePolicy = this.policies.resources.get(resourceName);
    if (!resourcePolicy) return null;
    
    const modelName = resourcePolicy.modelName || resourceName;
    return this.db[modelName] || null;
  }
}

// Экспорт синглтона
let instance = null;

export const getInstance = (db, options) => {
  if (!instance) {
    instance = new GlobalABAC(db, options);
  }
  return instance;
};

export default { getInstance };