// @martyrs/src/modules/core/controllers/classes/abac/abac.core.js
export default class ABACCore {
  constructor(abac) {
    this.abac = abac;
    this.runningPolicies = new Map();
  }

  /**
   * Нормализация контекста
   */
  normalizeContext(input) {
    const context = {
      user: null,
      action: null,
      resource: null,
      currentResource: null,
      resourceId: null, // Добавляем ID ресурса для кэша
      data: {},
      req: null,
      socket: null,
      params: {},
      _cache: new Map(),
      _abac: this.abac,
      skipFieldPolicies: input.skipFieldPolicies || false,
    };

    if (input.req) {
      // Express context - НЕ смешиваем body и query!
      context.user = input.user || input.req.userId;
      context.data = {
        body: input.req.body || {},
        query: input.req.query || {},
        params: input.req.params || {},
      };
      context.params = input.req.params;
      context.req = input.req;
      
      // Извлекаем ID ресурса для кэша
      context.resourceId = input.req.params?._id || 
                          input.req.params?.id || 
                          input.req.body?._id ||
                          input.req.body?.id;
    } else if (input.socket) {
      // WebSocket context
      context.user = input.user || input.socket.userId;
      context.socket = input.socket;
      context.data = input.data || {};
      context.resourceId = input.data?._id || input.data?.id;
    }

    // Merge остальные поля (но не перезаписываем data)
    return Object.assign(context, {
      ...input,
      data: context.data // Сохраняем структурированную data
    });
  }

  /**
   * Выполнение политики с кэшированием
   */
  async executePolicyWithCache(policyName, policyFn, context) {
    // Проверяем контекстный кэш
    const contextCacheKey = `${policyName}_${context.action}`;
    if (context._cache.has(contextCacheKey)) {
      return context._cache.get(contextCacheKey);
    }

    // Улучшенный глобальный кэш-ключ с ID ресурса
    const globalCacheKey = this._buildCacheKey(policyName, context);
    
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
      const tags = [
        `user_${context.user}`,
        `resource_${context.resource}`,
        `policy_${policyName}`
      ];
      
      if (context.resourceId) {
        tags.push(`resourceId_${context.resourceId}`);
      }
      
      await this.abac.cache.setWithTags(globalCacheKey, result, tags);
    }

    return result;
  }

  /**
   * Построение ключа кэша с учетом ID ресурса
   * @private
   */
  _buildCacheKey(policyName, context) {
    const parts = [
      'policy',
      policyName,
      context.user,
      context.resource,
      context.action
    ];
    
    if (context.resourceId) {
      parts.push(context.resourceId);
    }
    
    return parts.join('_');
  }

  /**
   * Выполнение политик с ограничением параллельности
   */
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
          this.abac.logger?.error('Policy execution error', { 
            policy: name, 
            error: error.message,
            stack: error.stack 
          });
          
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

  /**
   * Нормализация результата политики
   */
  normalizeResult(result, policyName) {
    if (this.abac.options.strictMode && result === undefined) {
      return { 
        allow: false, 
        force: false, 
        reason: `UNDEFINED_IN_STRICT_MODE_${policyName.toUpperCase()}` 
      };
    }
    
    if (result && typeof result === 'object' && ('allow' in result || 'force' in result)) {
      return {
        allow: result.allow !== undefined ? !!result.allow : true,
        force: !!result.force,
        reason: result.reason || `POLICY_${policyName.toUpperCase()}`,
      };
    }
    
    if (result === true) {
      return { 
        allow: true, 
        force: false, 
        reason: `ALLOWED_BY_${policyName.toUpperCase()}` 
      };
    }
    if (result === false) {
      return { 
        allow: false, 
        force: false, 
        reason: `DENIED_BY_${policyName.toUpperCase()}` 
      };
    }
    
    return { 
      allow: !this.abac.options.strictMode, 
      force: false, 
      reason: `NEUTRAL_${policyName.toUpperCase()}` 
    };
  }

  /**
   * Основной метод проверки доступа
   */
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
    if (!context.currentResource) {
      await this.loadResource(context);
    }

    // Выполнение политик
    const result = await this.abac.policies.evaluate(context, customPolicies);
    
    // Аудит
    if (this.abac.options.enableAudit) {
      await this.audit(context, result, Date.now() - startTime);
    }
    
    return result;
  }

  /**
   * Загрузка ресурса
   */
  async loadResource(context) {
    const resourceModel = this.abac.getResourceModel(context.resource);
    if (!resourceModel) return;

    try {
      let currentResource;
      // Ищем ID в структурированной data
      const id = context.resourceId || 
                 context.data?.body?._id || 
                 context.data?.params?._id;
      
      if (id) {
        currentResource = await resourceModel.findById(id);
      } else if (context.data?.body?.url || context.data?.params?.url) {
        const url = context.data.body?.url || context.data.params?.url;
        currentResource = await resourceModel.findOne({ url });
      }
      
      if (currentResource) {
        context.currentResource = currentResource;
        context.resourceModel = resourceModel;
        context.resourceId = currentResource._id?.toString();
      }
    } catch (error) {
      this.abac.logger?.error('Resource loading error', { 
        resource: context.resource,
        error: error.message 
      });
    }
  }

  /**
   * Структурированный аудит
   */
  async audit(context, result, duration) {
    try {
      const auditEntry = {
        type: 'ACCESS_CHECK',
        timestamp: new Date().toISOString(),
        user: context.user,
        resource: context.resource,
        resourceId: context.resourceId,
        action: context.action,
        result: result.allow,
        reason: result.reason,
        duration: duration,
        ip: context.req?.ip,
        userAgent: context.req?.get?.('user-agent'),
        metadata: context.auditMetadata || {}
      };
      
      // Используем структурированное логирование
      await this.abac.logger.info('Access check', auditEntry);
      
      // Если критическое действие - дополнительный алерт
      if (['delete', 'admin', 'export'].includes(context.action)) {
        await this.abac.logger.warn('Critical action attempt', auditEntry);
      }
    } catch (error) {
      this.abac.logger?.error('Audit logging error', { 
        error: error.message 
      });
    }
  }
}