// @martyrs/src/modules/globals/controllers/classes/abac/abac.policies.js
export default class ABACPolicies {
  constructor(abac) {
    this.abac = abac;
    this.global = new Map();
    this.resources = new Map();
    this.extensions = new Map();
    this.priorities = {
      static: [],
      dynamic: [],
      extensions: []
    };
  }

  registerGlobalPolicy(name, policyFn, metadata = {}) {
    if (typeof policyFn !== 'function') {
      throw new Error(`Global policy "${name}" must be a function`);
    }
    
    const policy = {
      fn: policyFn,
      type: metadata.type || 'dynamic',
      ...metadata
    };
    
    this.global.set(name, policy);
    this.updatePriorities();
    return this.abac;
  }

  registerResourcePolicy(resourceName, policyFn, options = {}) {
    if (typeof policyFn !== 'function') {
      throw new Error(`Resource policy for "${resourceName}" must be a function`);
    }
    
    this.resources.set(resourceName, {
      fn: policyFn,
      modelName: options.modelName || options.model || resourceName,
      ...options
    });
    return this.abac;
  }

  registerExtension(moduleName, extensionFn) {
    if (typeof extensionFn !== 'function') {
      throw new Error(`Extension "${moduleName}" must be a function`);
    }
    
    this.extensions.set(moduleName, extensionFn);
    this.updatePriorities();
    return this.abac;
  }

  updatePriorities() {
    // Группируем политики по типам
    this.priorities = {
      static: [],
      dynamic: [],
      extensions: []
    };

    for (const [name, policy] of this.global) {
      const type = policy.type || 'dynamic';
      this.priorities[type].push([name, policy]);
    }

    // Добавляем расширения
    this.priorities.extensions = Array.from(this.extensions.entries());
  }

  async evaluate(context, customPolicies = {}) {
    const core = this.abac.core;
    
    // Переменные для отслеживания результатов
    let hasForceAllow = false;
    let hasForceDisallow = false;
    let hasDeny = false;
    let denyReason = '';
    let allowReason = '';
    
    // Функция для обработки результата политики
    const processResult = (result) => {
      if (result.force) {
        if (result.allow) {
          hasForceAllow = true;
          allowReason = result.reason;
        } else {
          hasForceDisallow = true;
          denyReason = result.reason;
        }
      } else if (!result.allow) {
        hasDeny = true;
        if (!denyReason) denyReason = result.reason;
      }
    };
    
    // Функция для проверки force флагов
    const checkForceFlags = () => {
      if (hasForceDisallow) {
        return {
          allow: false,
          reason: denyReason || 'FORCE_DENIED_BY_POLICY',
        };
      }
      
      if (hasForceAllow) {
        return {
          allow: true,
          reason: allowReason || 'FORCE_ALLOWED_BY_POLICY',
        };
      }
      
      return null;
    };
    
    // Выполняем политики по типам
    for (const type of ['static', 'dynamic']) {
      const policies = [...this.priorities[type]];
      
      // Добавляем кастомные политики к dynamic
      if (type === 'dynamic') {
        for (const [name, fn] of Object.entries(customPolicies)) {
          policies.push([name, { fn, type: 'dynamic' }]);
        }
      }

      const results = await core.executePoliciesLimited(
        policies, 
        context,
        type === 'static' // Для static останавливаемся на deny
      );

      // Обрабатываем результаты
      for (const { result, error } of results) {
        if (error) continue;
        processResult(result);
      }
      
      // Проверяем force флаги после каждого этапа
      const forceResult = checkForceFlags();
      if (forceResult) return forceResult;
    }

    // Проверка политики ресурса
    const resourcePolicy = this.resources.get(context.resource);
    
    if (resourcePolicy) {
      const results = await core.executePoliciesLimited(
        [[`RESOURCE_${context.resource}`, resourcePolicy]], 
        context
      );
      
      if (!results[0].error) {
        processResult(results[0].result);
      }
      
      // Проверяем результат ресурсной политики
      const forceResult = checkForceFlags();
      if (forceResult) return forceResult;
    }
    
    // Проверяем накопленный deny перед расширениями
    if (hasDeny) {
      return {
        allow: false,
        reason: denyReason || 'DENIED_BY_POLICY',
      };
    }

    // Выполнение расширений
    const extensionResults = await core.executePoliciesLimited(
      this.priorities.extensions,
      context
    );
    
    for (const { result } of extensionResults) {
      if (result.allow) {
        return { allow: true, reason: result.reason };
      }
    }

    // Финальное решение
    const defaultAllow = !this.abac.options.defaultDeny;
    return {
      allow: defaultAllow,
      reason: defaultAllow ? 'DEFAULT_ALLOW' : 'DEFAULT_DENY',
    };
  }

  // Проверка конкретных политик
  async checkPolicies(rawContext, policyNames = [], customPolicies = {}) {
    const context = this.abac.core.normalizeContext(rawContext);
    const policies = this.getPoliciesByNames(policyNames, customPolicies);
    
    const results = await this.abac.core.executePoliciesLimited(
      Object.entries(policies), 
      context,
      this.abac.options.strictMode
    );

    // Анализируем результаты
    for (const { result } of results) {
      if (result.force) return { allow: result.allow, reason: result.reason };
      if (!result.allow && this.abac.options.strictMode) {
        return { allow: false, reason: result.reason };
      }
    }

    return { allow: true, reason: 'POLICIES_PASSED' };
  }

  getPoliciesByNames(names, customPolicies = {}) {
    const policies = {};
    
    for (const name of names) {
      if (this.global.has(name)) {
        policies[name] = this.global.get(name);
      } else if (this.extensions.has(name)) {
        policies[name] = { fn: this.extensions.get(name), type: 'extension' };
      }
    }
    
    Object.assign(policies, customPolicies);
    return policies;
  }
}