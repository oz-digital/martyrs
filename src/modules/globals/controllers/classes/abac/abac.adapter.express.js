// @martyrs/src/modules/globals/controllers/classes/abac/abac.adapter.express.js
export default class ABACExpressAdapter {
  constructor(abac) {
    this.abac = abac;
  }

  middleware(resource, action, options = {}) {
    return async (req, res, next) => {
      try {
        const context = {
          user: req.userId,
          resource,
          action,
          req,
          data: {
            ...req.body,
            ...req.query,
            params: req.params,
          },
          params: req.params,
          customPolicies: options.policies || {},
          options
        };
        
        const accessResult = await this.abac.checkAccess(context, context.customPolicies);

        if (!accessResult.allow) {
          return res.status(403).json({
            error: {
              code: 'ACCESS_DENIED',
              message: accessResult.reason
            }
          });
        }

        // Проверка полей если включена
        if (options.checkFields) {
          const fieldsResult = await this.abac.checkFields(context, req.body, action);
          
          if (fieldsResult.errors.length > 0 && options.strictFieldsMode) {
            return res.status(400).json({
              error: {
                code: 'FIELD_VALIDATION_ERROR',
                fields: fieldsResult.errors
              }
            });
          }
          
          // Заменяем body отфильтрованными данными
          req.body = fieldsResult.allowed;
          req.abacFieldsResult = fieldsResult;
        }

        next();
      } catch (error) {
        console.error('ABAC middleware error:', error);
        res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Access control error'
          }
        });
      }
    };
  }

  policyMiddleware(policyNames = [], customPolicies = {}, options = {}) {
    return async (req, res, next) => {
      try {
        const context = {
          user: req.userId,
          resource: options.resource || 'custom',
          action: options.action || 'access',
          req,
          data: {
            ...req.body,
            ...req.query,
            params: req.params,
          },
          params: req.params,
          options
        };

        const result = await this.abac.checkPolicies(context, policyNames, customPolicies);
        
        if (!result.allow) {
          return res.status(403).json({
            error: {
              code: 'POLICY_DENIED',
              message: result.reason
            }
          });
        }

        next();
      } catch (error) {
        console.error('Policy middleware error:', error);
        res.status(500).json({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Policy check error'
          }
        });
      }
    };
  }

  fieldsMiddleware(resource, options = {}) {
    return async (req, res, next) => {
      try {
        // Определяем action из метода запроса
        const methodActionMap = {
          'GET': 'read',
          'POST': 'create',
          'PUT': 'update',
          'PATCH': 'update',
          'DELETE': 'delete'
        };
        
        const action = options.action || methodActionMap[req.method] || 'access';
        
        const context = {
          user: req.userId,
          resource,
          action,
          req,
          data: {
            ...req.body,
            ...req.query,
            params: req.params,
          },
          params: req.params,
          options
        };

        // Определяем какие данные проверять
        let dataToCheck = req.body;
        
        // Для GET запросов проверяем query параметры
        if (req.method === 'GET' && options.checkQuery) {
          dataToCheck = req.query;
        }
        
        // Для ответов проверяем res.locals.data
        if (options.checkResponse && res.locals.data) {
          dataToCheck = res.locals.data;
        }

        const fieldsResult = await this.abac.checkFields(context, dataToCheck, action);
        
        // Обработка ошибок
        if (fieldsResult.errors.length > 0) {
          if (options.strictMode) {
            return res.status(400).json({
              error: {
                code: 'FIELD_VALIDATION_ERROR',
                fields: fieldsResult.errors
              }
            });
          }
          // В нестрогом режиме логируем ошибки
          console.warn('Field validation errors:', fieldsResult.errors);
        }
        
        // Применяем результаты
        if (req.method === 'GET' && options.checkQuery) {
          req.query = fieldsResult.allowed;
        } else if (options.checkResponse && res.locals.data) {
          res.locals.data = fieldsResult.transformed || fieldsResult.allowed;
        } else {
          req.body = fieldsResult.allowed;
        }
        
        // Сохраняем результат для дальнейшего использования
        req.abacFieldsResult = fieldsResult;
        
        next();
      } catch (error) {
        console.error('Fields middleware error:', error);
        
        if (options.passErrors) {
          next(error);
        } else {
          res.status(500).json({
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Field check error'
            }
          });
        }
      }
    };
  }
}