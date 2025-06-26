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

  /**
   * Регистрация глобальной политики
   */
  registerGlobalPolicy(name, policyFn, metadata = {}) {
    if (typeof policyFn !== 'function') {
      throw new Error(`Global policy "${name}" must be a function`);
    }
    
    const policy = {
      fn: policyFn,
      type: metadata.type || 'dynamic',
      priority: metadata.priority || 0,
      ...metadata
    };
    
    this.global.set(name, policy);
    this.updatePriorities();
    return this.abac;
  }

  /**
   * Регистрация политики ресурса
   */
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

  /**
   * Регистрация расширения
   */
  registerExtension(moduleName, extensionFn) {
    if (typeof extensionFn !== 'function') {
      throw new Error(`Extension "${moduleName}" must be a function`);
    }
    
    this.extensions.set(moduleName, extensionFn);
    this.updatePriorities();
    return this.abac;
  }

  /**
   * Обновление приоритетов с сортировкой
   */
  updatePriorities() {
    this.priorities = {
      static: [],
      dynamic: [],
      extensions: []
    };

    // Группируем и сортируем по приоритету
    for (const [name, policy] of this.global) {
      const type = policy.type || 'dynamic';
      this.priorities[type].push([name, policy]);
    }

    // Сортировка по приоритету (выше = раньше)
    this.priorities.static.sort((a, b) => (b[1].priority || 0) - (a[1].priority || 0));
    this.priorities.dynamic.sort((a, b) => (b[1].priority || 0) - (a[1].priority || 0));

    // Добавляем расширения
    this.priorities.extensions = Array.from(this.extensions.entries());
  }

  /**
   * Основная логика оценки политик
   */
  async evaluate(context, customPolicies = {}) {
    const core = this.abac.core;
    
    // Структура для отслеживания результатов
    const evaluation = {
      hasForceAllow: false,
      hasForceDisallow: false,
      hasDeny: false,
      denyReason: '',
      allowReason: '',
      appliedPolicies: []
    };
    
    // Функция для обработки результата политики
    const processResult = (name, result) => {
      evaluation.appliedPolicies.push({ name, result });
      
      if (result.force) {
        if (result.allow) {
          evaluation.hasForceAllow = true;
          evaluation.allowReason = result.reason;
        } else {
          evaluation.hasForceDisallow = true;
          evaluation.denyReason = result.reason;
        }
      } else if (!result.allow) {
        evaluation.hasDeny = true;
        if (!evaluation.denyReason) {
          evaluation.denyReason = result.reason;
        }
      }
    };
    
    // Функция для проверки force флагов
    const checkForceFlags = () => {
      if (evaluation.hasForceDisallow) {
        return {
          allow: false,
          reason: evaluation.denyReason || 'FORCE_DENIED_BY_POLICY',
          policies: evaluation.appliedPolicies
        };
      }
      
      if (evaluation.hasForceAllow) {
        return {
          allow: true,
          reason: evaluation.allowReason || 'FORCE_ALLOWED_BY_POLICY',
          policies: evaluation.appliedPolicies
        };
      }
      
      return null;
    };
    
    // 1. Static политики (с early exit)
    const staticResults = await core.executePoliciesLimited(
      this.priorities.static, 
      context,
      true // останавливаемся на deny
    );

    for (const { name, result, error } of staticResults) {
      if (!error) {
        processResult(name, result);
      }
    }
    
    let forceResult = checkForceFlags();
    if (forceResult) return forceResult;

    // 2. Dynamic политики + custom
    const dynamicPolicies = [...this.priorities.dynamic];
    
    // Добавляем кастомные политики
    for (const [name, fn] of Object.entries(customPolicies)) {
      dynamicPolicies.push([name, { fn, type: 'dynamic' }]);
    }

    const dynamicResults = await core.executePoliciesLimited(
      dynamicPolicies, 
      context,
      false
    );

    for (const { name, result, error } of dynamicResults) {
      if (!error) {
        processResult(name, result);
      }
    }
    
    forceResult = checkForceFlags();
    if (forceResult) return forceResult;

    // 3. Resource-specific политика
    const resourcePolicy = this.resources.get(context.resource);
    
    if (resourcePolicy) {
      const results = await core.executePoliciesLimited(
        [[`RESOURCE_${context.resource}`, resourcePolicy]], 
        context
      );
      
      if (!results[0].error) {
        processResult(`RESOURCE_${context.resource}`, results[0].result);
      }
      
      forceResult = checkForceFlags();
      if (forceResult) return forceResult;
    }
    
    // Проверяем накопленный deny
    if (evaluation.hasDeny) {
      return {
        allow: false,
        reason: evaluation.denyReason || 'DENIED_BY_POLICY',
        policies: evaluation.appliedPolicies
      };
    }

    // 4. Extensions (последний шанс разрешить)
    const extensionResults = await core.executePoliciesLimited(
      this.priorities.extensions,
      context
    );
    
    for (const { name, result } of extensionResults) {
      processResult(name, result);
      if (result.allow) {
        return { 
          allow: true, 
          reason: result.reason,
          policies: evaluation.appliedPolicies
        };
      }
    }

    // Финальное решение
    const defaultAllow = !this.abac.options.defaultDeny;
    return {
      allow: defaultAllow,
      reason: defaultAllow ? 'DEFAULT_ALLOW' : 'DEFAULT_DENY',
      policies: evaluation.appliedPolicies
    };
  }

  /**
   * Проверка конкретных политик
   */
  async checkPolicies(rawContext, policyNames = [], customPolicies = {}) {
    const context = this.abac.core.normalizeContext(rawContext);
    const policies = this.getPoliciesByNames(policyNames, customPolicies);
    
    const results = await this.abac.core.executePoliciesLimited(
      Object.entries(policies), 
      context,
      this.abac.options.strictMode
    );

    // Структурированный анализ результатов
    const evaluation = {
      passed: [],
      failed: [],
      errors: []
    };

    for (const { name, result, error } of results) {
      if (error) {
        evaluation.errors.push({ name, error: error.message });
        continue;
      }
      
      if (result.force) {
        return { 
          allow: result.allow, 
          reason: result.reason,
          evaluation 
        };
      }
      
      if (result.allow) {
        evaluation.passed.push(name);
      } else {
        evaluation.failed.push({ name, reason: result.reason });
        
        if (this.abac.options.strictMode) {
          return { 
            allow: false, 
            reason: result.reason,
            evaluation
          };
        }
      }
    }

    const allPassed = evaluation.failed.length === 0 && evaluation.errors.length === 0;
    
    return { 
      allow: allPassed, 
      reason: allPassed ? 'POLICIES_PASSED' : `FAILED: ${evaluation.failed[0]?.name}`,
      evaluation
    };
  }

  /**
   * Получение политик по именам
   */
  getPoliciesByNames(names, customPolicies = {}) {
    const policies = {};
    
    for (const name of names) {
      if (this.global.has(name)) {
        policies[name] = this.global.get(name);
      } else if (this.extensions.has(name)) {
        policies[name] = { fn: this.extensions.get(name), type: 'extension' };
      } else if (this.resources.has(name)) {
        policies[name] = this.resources.get(name);
      } else {
        this.abac.logger?.warn('Policy not found', { name });
      }
    }
    
    // Добавляем кастомные
    Object.assign(policies, customPolicies);
    return policies;
  }
}