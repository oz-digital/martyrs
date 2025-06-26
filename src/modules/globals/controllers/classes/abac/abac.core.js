// @martyrs/src/modules/globals/controllers/classes/abac/abac.core.js
export default class ABACCore {
  constructor(abac) {
    this.abac = abac;
    this.runningPolicies = new Map(); // Для контроля параллельности
  }

  // Нормализация контекста
  normalizeContext(input) {
    const context = {
      user: null,
      action: null,
      resource: null,
      currentResource: null,
      data: {},
      req: null,
      socket: null,
      params: {},
      _cache: new Map(),
      _abac: this.abac,
      // Добавляем флаг для пропуска field policies (например, для админов)
      skipFieldPolicies: input.skipFieldPolicies || false,
    };

    if (input.req) {
      // Express context
      context.user = input.user || input.req.userId;
      context.data = {
        ...input.req.body,
        ...input.req.query,
        params: input.req.params,
      };
      context.params = input.req.params;
      context.req = input.req;
    } else if (input.socket) {
      // WebSocket context
      context.user = input.user || input.socket.userId;
      context.socket = input.socket;
      context.data = input.data || {};
    }

    // Merge остальные поля
    return Object.assign(context, input);
  }

  // Выполнение политики с кэшированием
  async executePolicyWithCache(policyName, policyFn, context) {
    // Проверяем контекстный кэш
    const contextCacheKey = `${policyName}_${context.action}`;
    if (context._cache.has(contextCacheKey)) {
      return context._cache.get(contextCacheKey);
    }

    // Проверяем глобальный кэш
    const globalCacheKey = `policy_${policyName}_${context.user}_${context.resource}_${context.action}`;
    if (this.abac.options.cacheEnabled) {
      const cached = await this.abac.cache.get(globalCacheKey);
      if (cached !== undefined) {
        context._cache.set(contextCacheKey, cached);
        return cached;
      }
    }

    // Выполняем политику
    const result = await policyFn(context);
    
    // Сохраняем в кэш
    context._cache.set(contextCacheKey, result);
    if (this.abac.options.cacheEnabled) {
      await this.abac.cache.setWithTags(globalCacheKey, result, [
        `user_${context.user}`,
        `resource_${context.resource}`,
        `policy_${policyName}`
      ]);
    }

    return result;
  }

  // Выполнение политик с ограничением параллельности
  async executePoliciesLimited(policies, context, stopOnDeny = false) {
    const results = [];
    const limit = this.abac.options.concurrencyLimit;
    
    // Разбиваем на батчи
    const batches = [];
    for (let i = 0; i < policies.length; i += limit) {
      batches.push(policies.slice(i, i + limit));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async ([name, policy]) => {
        try {
          const policyFn = typeof policy === 'function' ? policy : policy.fn;
          const result = await this.executePolicyWithCache(name, policyFn, context);
          return { name, result: this.normalizeResult(result, name) };
        } catch (error) {
          console.error(`Error in policy ${name}:`, error);
          return { 
            name, 
            result: { 
              allow: !this.abac.options.strictMode, 
              reason: `POLICY_ERROR_${name.toUpperCase()}` 
            },
            error
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Проверяем нужно ли остановиться
      if (stopOnDeny) {
        const shouldStop = batchResults.some(r => !r.result.allow || r.result.force);
        if (shouldStop) break;
      }
    }

    return results;
  }

  // Нормализация результата политики
  normalizeResult(result, policyName) {
    if (this.abac.options.strictMode && result === undefined) {
      return { allow: false, force: false, reason: `UNDEFINED_IN_STRICT_MODE_${policyName.toUpperCase()}` };
    }
    
    if (result && typeof result === 'object' && ('allow' in result || 'force' in result)) {
      return {
        allow: result.allow !== undefined ? !!result.allow : true,
        force: !!result.force,
        reason: result.reason || `POLICY_${policyName.toUpperCase()}`,
      };
    }
    
    if (result === true) {
      return { allow: true, force: false, reason: `ALLOWED_BY_${policyName.toUpperCase()}` };
    }
    if (result === false) {
      return { allow: false, force: false, reason: `DENIED_BY_${policyName.toUpperCase()}` };
    }
    
    return { allow: !this.abac.options.strictMode, force: false, reason: `NEUTRAL_${policyName.toUpperCase()}` };
  }

  // Основной метод проверки доступа
  async checkAccess(rawContext, customPolicies = {}) {
    const startTime = Date.now();
    const context = this.normalizeContext(rawContext);

    // Проверка сервисного запроса
    if (context.isServiceRequest) {
      return { allow: true, reason: 'SERVICE_REQUEST_ALLOWED' };
    }

    // Проверка аутентификации
    if (!context.user && !context.options?.allowUnauthenticated) {
      return { allow: false, reason: 'UNAUTHENTICATED_ACCESS_DENIED' };
    }

    // Предзагрузка ресурса
    if (!context.currentResource && (context.data?._id || context.data?.params?._id || context.data?.url)) {
      await this.loadResource(context);
    }

    // Выполнение политик
    const result = await this.abac.policies.evaluate(context, customPolicies);
    
    // Аудит
    if (this.abac.options.enableAudit) {
      await this.audit(context, result, Date.now() - startTime);
    }
    console.error('result logging:', result);
    return result;
  }

  // Загрузка ресурса
  async loadResource(context) {
    const resourceModel = this.abac.getResourceModel(context.resource);
    if (!resourceModel) return;

    try {
      let currentResource;
      const id = context.data._id || context.data.params?._id;
      
      if (id) {
        currentResource = await resourceModel.findById(id);
      } else if (context.data.url) {
        currentResource = await resourceModel.findOne({ url: context.data.url });
      }
      
      if (currentResource) {
        context.currentResource = currentResource;
        context.resourceModel = resourceModel;
      }
    } catch (error) {
      console.error('Resource loading error:', error);
    }
  }

  // Аудит
  async audit(context, result, duration) {
    try {
      let info = JSON.stringify({
        type: 'ACCESS_CHECK',
        timestamp: new Date(),
        user: context.user,
        resource: context.resource,
        action: context.action,
        result: result.allow,
        reason: result.reason,
        duration: duration,
        metadata: context.auditMetadata || {}
      })
      await this.abac.logger.log('info', info);
      console.error('Audit logging:', info);
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }
}