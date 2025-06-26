// @martyrs/src/modules/globals/controllers/classes/abac/abac.adapter.express.js
export default class ABACExpressAdapter {
  constructor(abac) {
    this.abac = abac;
  }

  /**
   * Основной middleware - разделен на составные части
   */
  middleware(resource, action, options = {}) {
    const middlewares = [];
    
    // 1. Access control
    middlewares.push(this._accessMiddleware(resource, action, options));
    
    // 2. Field validation (если включена)
    if (options.checkFields) {
      middlewares.push(this._fieldsValidationMiddleware(resource, action, options));
    }
    
    return middlewares;
  }

  /**
   * Middleware проверки доступа
   * @private
   */
  _accessMiddleware(resource, action, options = {}) {
    return async (req, res, next) => {
      try {
        const context = this._buildContext(req, resource, action, options);
        const accessResult = await this.abac.checkAccess(context, context.customPolicies);

        if (!accessResult.allow) {
          return this._sendAccessDenied(res, accessResult.reason);
        }

        // Сохраняем результат для последующих middleware
        req.abacContext = context;
        req.abacAccessResult = accessResult;
        next();
      } catch (error) {
        this.abac.logger?.error('ABAC middleware error', {
          resource,
          action,
          error: error.message,
          stack: error.stack
        });
        return this._sendError(res);
      }
    };
  }

  /**
   * Middleware проверки полей
   * @private
   */
  _fieldsValidationMiddleware(resource, action, options = {}) {
    return async (req, res, next) => {
      try {
        const context = req.abacContext || this._buildContext(req, resource, action, options);
        const fieldsResult = await this.abac.checkFields(context, req.body, action);
        
        if (fieldsResult.errors.length > 0 && options.strictFieldsMode) {
          return this._sendFieldError(res, fieldsResult.errors);
        }
        
        // Заменяем body отфильтрованными данными
        req.body = fieldsResult.allowed;
        req.abacFieldsResult = fieldsResult;
        
        next();
      } catch (error) {
        this.abac.logger?.error('Fields middleware error', {
          resource,
          action,
          error: error.message
        });
        
        if (options.passErrors) {
          next(error);
        } else {
          return this._sendError(res);
        }
      }
    };
  }

  /**
   * Построение контекста
   * @private
   */
  _buildContext(req, resource, action, options = {}) {
    return {
      user: req.userId,
      resource,
      action,
      req,
      // НЕ смешиваем body и query - передаем структурированно
      data: {
        body: req.body || {},
        query: req.query || {},
        params: req.params || {}
      },
      params: req.params,
      customPolicies: options.policies || {},
      options
    };
  }

  /**
   * Policy middleware
   */
  policyMiddleware(policyNames = [], customPolicies = {}, options = {}) {
    return async (req, res, next) => {
      try {
        const context = this._buildContext(
          req, 
          options.resource || 'custom',
          options.action || 'access',
          options
        );

        const result = await this.abac.checkPolicies(context, policyNames, customPolicies);
        
        if (!result.allow) {
          return this._sendPolicyDenied(res, result.reason);
        }

        req.abacPolicyResult = result;
        next();
      } catch (error) {
        this.abac.logger?.error('Policy middleware error', {
          policies: policyNames,
          error: error.message
        });
        return this._sendError(res);
      }
    };
  }

  /**
   * Fields middleware для проверки/трансформации полей
   */
  fieldsMiddleware(resource, options = {}) {
    return async (req, res, next) => {
      try {
        // Определяем action из метода запроса
        const action = options.action || this._getActionFromMethod(req.method);
        const context = this._buildContext(req, resource, action, options);

        // Определяем какие данные проверять
        let dataToCheck = this._getDataToCheck(req, res, options);

        const fieldsResult = await this.abac.checkFields(context, dataToCheck, action);
        
        // Обработка ошибок
        if (fieldsResult.errors.length > 0) {
          if (options.strictMode) {
            return this._sendFieldError(res, fieldsResult.errors);
          }
          // В нестрогом режиме логируем ошибки
          this.abac.logger?.warn('Field validation errors', {
            resource,
            action,
            errors: fieldsResult.errors
          });
        }
        
        // Применяем результаты
        this._applyFieldsResult(req, res, options, fieldsResult);
        
        // Сохраняем результат
        req.abacFieldsResult = fieldsResult;
        
        next();
      } catch (error) {
        this.abac.logger?.error('Fields middleware error', {
          resource,
          error: error.message
        });
        
        if (options.passErrors) {
          next(error);
        } else {
          return this._sendError(res);
        }
      }
    };
  }

  /**
   * Получение action из HTTP метода
   * @private
   */
  _getActionFromMethod(method) {
    const methodActionMap = {
      'GET': 'read',
      'POST': 'create',
      'PUT': 'update',
      'PATCH': 'update',
      'DELETE': 'delete'
    };
    return methodActionMap[method] || 'access';
  }

  /**
   * Определение данных для проверки
   * @private
   */
  _getDataToCheck(req, res, options) {
    if (req.method === 'GET' && options.checkQuery) {
      return req.query;
    }
    
    if (options.checkResponse && res.locals.data) {
      return res.locals.data;
    }
    
    return req.body;
  }

  /**
   * Применение результатов проверки полей
   * @private
   */
  _applyFieldsResult(req, res, options, fieldsResult) {
    if (req.method === 'GET' && options.checkQuery) {
      req.query = fieldsResult.allowed;
    } else if (options.checkResponse && res.locals.data) {
      res.locals.data = fieldsResult.transformed || fieldsResult.allowed;
    } else {
      req.body = fieldsResult.allowed;
    }
  }

  /**
   * Отправка ошибок - унифицированные методы
   * @private
   */
  _sendAccessDenied(res, reason) {
    return res.status(403).json({
      error: {
        code: 'ACCESS_DENIED',
        message: reason
      }
    });
  }

  _sendPolicyDenied(res, reason) {
    return res.status(403).json({
      error: {
        code: 'POLICY_DENIED',
        message: reason
      }
    });
  }

  _sendFieldError(res, errors) {
    return res.status(400).json({
      error: {
        code: 'FIELD_VALIDATION_ERROR',
        fields: errors
      }
    });
  }

  _sendError(res) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Access control error'
      }
    });
  }
}