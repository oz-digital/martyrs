class GlobalABAC {
  constructor(db, options = {}) {
    // Основные политики и обработчики
    this.policies = {
      global: {}, // Глобальные политики
      resources: {}, // Политики для ресурсов
      extensions: {}, // Расширения от внешних модулей
    };
    // Настройки по умолчанию
    this.options = {
      strictMode: false,
      defaultDeny: false,
      serviceKey: process.env.SERVICE_KEY, // Добавляем ключ сервиса из env
      ...options,
    };
    // Сохраняем ссылку на базу данных
    this.db = db;
  }
  // Регистрация глобальной политики
  registerGlobalPolicy(name, policyFn) {
    this.policies.global[name] = policyFn;
    return this;
  }
  // Регистрация политики для ресурса
  registerResourcePolicy(resourceName, policyFn) {
    this.policies.resources[resourceName] = policyFn;
    return this;
  }
  // Метод для регистрации расширений от внешних модулей
  registerExtension(moduleName, extensionFn) {
    // Если расширение уже существует, объединяем функции
    if (this.policies.extensions[moduleName]) {
      const existingExtension = this.policies.extensions[moduleName];
      this.policies.extensions[moduleName] = async context => {
        const existingResult = await existingExtension(context);
        if (existingResult) return existingResult;
        return await extensionFn(context);
      };
    } else {
      this.policies.extensions[moduleName] = extensionFn;
    }
    return this;
  }
  // Автоматическое определение модели по имени ресурса
  getResourceModel(resourceName) {
    if (resourceName === 'posts') resourceName = 'blogposts';
    // Преобразуем название ресурса в singural форму модели
    const modelName = resourceName.endsWith('s') ? resourceName.slice(0, -1) : resourceName;
    // Ищем модель в базе данных
    const model = this.db[modelName];
    if (!model) {
      throw new Error(`Model for resource ${resourceName} not found`);
    }
    return model;
  }
  /**
   * Нормализация результата политики для единообразной обработки
   * @param {any} result - Результат выполнения политики
   * @param {string} policyName - Имя политики для формирования причины
   * @returns {Object} Нормализованный результат
   */
  _normalizeResult(result, policyName) {
    // Результат уже в формате объекта с нужными полями
    if (result && typeof result === 'object' && ('allow' in result || 'force' in result)) {
      return {
        allow: !!result.allow,
        force: !!result.force,
        reason: result.reason || `POLICY_${policyName.toUpperCase()}`,
      };
    }
    // Boolean результаты
    if (result === true) {
      return { allow: true, force: false, reason: `ALLOWED_BY_${policyName.toUpperCase()}` };
    }
    if (result === false) {
      return { allow: false, force: false, reason: `DENIED_BY_${policyName.toUpperCase()}` };
    }
    // Специальные случаи для adminAccessGranted и подобных
    if (result === undefined && policyName === 'AdminModeratorAccessPolicy' && this._context && this._context.adminAccessGranted) {
      return { allow: true, force: true, reason: 'ADMIN_MODERATOR_ACCESS_GRANTED' };
    }
    // Нейтральный результат (пропуск политики)
    return { allow: true, force: false, reason: `NEUTRAL_${policyName.toUpperCase()}` };
  }
  // Базовый метод проверки доступа
  async checkAccess(context) {
    this._context = context; // Сохраняем контекст для использования в _normalizeResult
    const {
      user, // Пользователь
      resource, // Тип ресурса
      action, // Действие
      data, // Данные ресурса
      options = {}, // Добавляем опции
      isServiceRequest, // Флаг сервисного запроса
    } = context;
    // Если это сервисный запрос, пропускаем проверки
    if (isServiceRequest) {
      return {
        allow: true,
        reason: 'SERVICE_REQUEST_ALLOWED',
      };
    }
    // Проверка базовой аутентификации
    if (!user && !options.allowUnauthenticated) {
      return {
        allow: false,
        reason: 'UNAUTHENTICATED_ACCESS_DENIED',
      };
    }
    // Предзагрузка ресурса
    if (data._id || data.params?._id || data.url) {
      try {
        const resourceModel = this.getResourceModel(resource);
        let currentResource;
        if (data._id || data.params?._id) {
          currentResource = await resourceModel.findById(data._id || data.params._id);
        } else if (data.url) {
          currentResource = await resourceModel.findOne({ url: data.url });
        }
        if (!currentResource) {
          return {
            allow: false,
            reason: 'RESOURCE_NOT_FOUND',
          };
        }
        // Добавляем загруженный ресурс в контекст
        context.currentResource = currentResource;
        // Добавляем модель ресурса в контекст
        context.resourceModel = resourceModel;
      } catch (error) {
        console.error('Resource loading error:', error);
        return {
          allow: false,
          reason: 'RESOURCE_LOAD_ERROR',
        };
      }
    }
    // Выполнение всех глобальных политик параллельно
    const policyEntries = Object.entries(this.policies.global);
    const policyPromises = policyEntries.map(async ([policyName, policyFn]) => {
      try {
        const result = await policyFn(context);
        return { policyName, result };
      } catch (error) {
        console.error(`Error in policy ${policyName}:`, error);
        // При ошибке возвращаем нейтральный результат
        return { policyName, result: undefined, error };
      }
    });
    // Ожидаем выполнения всех политик
    const policyResults = await Promise.all(policyPromises);
    // Обработка результатов глобальных политик
    let hasForceAllow = false;
    let hasForceDisallow = false;
    let hasDeny = false;
    let denyReason = '';
    let allowReason = '';
    for (const { policyName, result, error } of policyResults) {
      if (error) continue; // Пропускаем политики с ошибками
      // Нормализуем результат для унифицированной обработки
      const normalizedResult = this._normalizeResult(result, policyName);
      if (normalizedResult.force) {
        if (normalizedResult.allow) {
          hasForceAllow = true;
          allowReason = normalizedResult.reason;
        } else {
          hasForceDisallow = true;
          denyReason = normalizedResult.reason;
        }
      } else if (!normalizedResult.allow) {
        hasDeny = true;
        if (!denyReason) denyReason = normalizedResult.reason;
      }
    }
    // Принятие решения на основе результатов
    // 1. Проверка на стопроцентный запрет
    if (hasForceDisallow) {
      return {
        allow: false,
        reason: denyReason || 'FORCE_DENIED_BY_POLICY',
      };
    }
    // 2. Проверка на стопроцентный доступ
    if (hasForceAllow) {
      return {
        allow: true,
        reason: allowReason || 'FORCE_ALLOWED_BY_POLICY',
      };
    }
    // 3. Проверка на обычный запрет
    if (hasDeny) {
      return {
        allow: false,
        reason: denyReason || 'DENIED_BY_POLICY',
      };
    }
    // 4. Проверка политик ресурсов (возможно асинхронное выполнение)
    if (this.policies.resources[resource]) {
      try {
        const resourceResult = await this.policies.resources[resource](context);
        const normalizedResult = this._normalizeResult(resourceResult, `RESOURCE_${resource}`);
        if (normalizedResult.force) {
          return {
            allow: normalizedResult.allow,
            reason: normalizedResult.reason,
          };
        }
        if (!normalizedResult.allow) {
          return {
            allow: false,
            reason: normalizedResult.reason,
          };
        }
        if (normalizedResult.allow) {
          return {
            allow: true,
            reason: normalizedResult.reason,
          };
        }
      } catch (error) {
        console.error(`Error in resource policy for ${resource}:`, error);
      }
    }
    // 5. Выполнение расширений от внешних модулей
    const extensionPromises = Object.entries(this.policies.extensions).map(async ([moduleName, extensionFn]) => {
      try {
        const extensionResult = await extensionFn(context);
        return { moduleName, result: extensionResult };
      } catch (error) {
        console.error(`Error in extension ${moduleName}:`, error);
        return { moduleName, result: null, error };
      }
    });
    const extensionResults = await Promise.all(extensionPromises);
    for (const { moduleName, result, error } of extensionResults) {
      if (error) continue;
      if (result && result.allow) {
        return {
          allow: true,
          reason: `ALLOWED_BY_${moduleName.toUpperCase()}_EXTENSION`,
        };
      }
    }
    // 6. Финальное решение на основе настроек
    return {
      allow: !this.options.defaultDeny,
      reason: this.options.defaultDeny ? 'ACCESS_DENIED' : 'ACCESS_ALLOWED',
    };
  }
  // Проверка сервисного ключа
  validateServiceKey(providedKey) {
    return providedKey && providedKey === this.options.serviceKey;
  }
  // Middleware для Express
  middleware(resource, action, options = {}) {
    return async (req, res, next) => {
      try {
        // Проверка сервисного ключа
        const serviceKey = req.headers['x-service-key'];
        if (serviceKey && this.validateServiceKey(serviceKey)) {
          req.isServiceRequest = true; // Помечаем, что это запрос от другого сервиса
          return next();
        }
        const context = {
          user: req.userId,
          resource,
          action,
          data: {
            ...req.body,
            ...req.query,
            params: req.params,
          },
          options, // Передаем опции в контекст
          req, // Передаем весь объект запроса для максимальной гибкости
          res, // И объект ответа
          isServiceRequest: req.isServiceRequest, // Передаем флаг сервисного запроса
        };
        const accessResult = await this.checkAccess(context);
        if (context.req?.body) req.body = context.req.body;
        if (context.req?.query) req.query = context.req.query;
        if (context.data?.params) req.params = context.data.params;
        if (accessResult.allow) {
          req.accessResult = accessResult;
          return next();
        }
        return res.status(403).json({
          errorCode: accessResult.reason,
          message: 'Access Denied',
        });
      } catch (error) {
        console.error('Access control error:', error);
        return res.status(500).json({
          errorCode: 'INTERNAL_ACCESS_CONTROL_ERROR',
          message: 'Internal Server Error',
        });
      }
    };
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
export default {
  getInstance,
};
