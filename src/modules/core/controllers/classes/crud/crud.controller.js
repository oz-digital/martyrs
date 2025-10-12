// @martyrs/src/modules/core/controllers/classes/crud/crud.controller.js
import jwtFactory from '@martyrs/src/modules/auth/controllers/middlewares/authJwt.js';

class CRUDController {
  constructor(crud) {
    this.crud = crud;
    this.routes = new Map();
    this.middlewares = {
      before: {},
      after: {}
    };
    
    // Инициализируем JWT middleware
    this.jwt = jwtFactory(crud.db);
  }

  // Добавление middleware
  addMiddleware(phase, action, middleware) {
    if (!['before', 'after'].includes(phase)) {
      throw new Error(`Invalid middleware phase: ${phase}`);
    }
    
    if (!this.middlewares[phase][action]) {
      this.middlewares[phase][action] = [];
    }
    
    this.middlewares[phase][action].push(middleware);
  }

  // Получение middleware для действия
  getMiddlewares(phase, action) {
    return this.middlewares[phase][action] || [];
  }

  // Регистрация роута
  registerRoute(method, path, actionName) {
    const fullPath = `${this.crud.basePath}${path}`;
    const middlewareStack = [];
    
    // Добавляем JWT middleware если нужно
    if (this.crud.core.isAuthEnabled()) {
      const authRequired = this.crud.core.getAuth(actionName);
      
      // Передаем параметр optional (continueOnFail) = !authRequired
      // Если auth не требуется - продолжаем выполнение без токена
      // Если auth требуется - возвращаем 401 при отсутствии токена
      middlewareStack.push(this.jwt.verifyToken(!authRequired));
    }
    
    
    // Добавляем верификацию
    const verifierMiddleware = this._createVerifierMiddleware(method, actionName);
    if (verifierMiddleware) {
      middlewareStack.push(verifierMiddleware);
    }
    
    // Добавляем before middleware
    middlewareStack.push(...this.getMiddlewares('before', actionName));
    
    // Добавляем ABAC middleware
    const abacMiddleware = this.crud.policies.getPoliciesMiddleware(actionName);
    if (abacMiddleware) {
      middlewareStack.push(abacMiddleware);
    }
    
    // Добавляем fields middleware для операций с данными
    if (['create', 'update'].includes(actionName)) {
      const fieldsMiddleware = this.crud.policies.getFieldsMiddleware(actionName);
      if (fieldsMiddleware) {
        middlewareStack.push(fieldsMiddleware);
      }
    }
    
    // Создаем handler для стандартных CRUD операций
    const handler = this._createHandler(actionName);
    
    // Оборачиваем handler для поддержки after middleware
    const wrappedHandler = this._wrapHandler(handler, actionName);
    
    // Регистрируем роут в Express
    this.crud.app[method](fullPath, ...middlewareStack, wrappedHandler);
    
    // Сохраняем информацию о роуте
    this.routes.set(`${method.toUpperCase()} ${fullPath}`, {
      method,
      path: fullPath,
      actionName,
      middlewareStack
    });
    
    return this;
  }

  // Регистрация кастомного роута
  registerCustomRoute(method, path, actionName, handler) {
    // Сохраняем кастомный handler в service
    this.crud.service.registerCustomHandler(actionName, handler);
    
    // Регистрируем роут
    return this.registerRoute(method, path, actionName);
  }

  // Создание handler для стандартных CRUD операций
  _createHandler(actionName) {
    switch (actionName) {
      case 'create':
        return async (req, res) => {
          try {
            const data = req.verified || req.body;
            const context = this._buildContext(req);
            
            const created = await this.crud.service.create(data, context);
            res.status(201).json(created);
          } catch (error) {
            this._handleError(error, res);
          }
        };
        
      case 'read':
        return async (req, res) => {
          try {
            const query = req.verified || req.query;
            const context = this._buildContext(req);
            
            let data = await this.crud.service.read(query, context);
            
            // Фильтрация полей для read
            if (this.crud.policies.hasAbac()) {
              data = await this.crud.policies.filterFieldsForRead(req, data);
            }
            
            res.json(data);
          } catch (error) {
            this._handleError(error, res);
          }
        };
        
      case 'update':
        return async (req, res) => {
          try {
            const data = req.verified || req.body;
            const { _id, ...updateData } = data;
            
            if (!_id) {
              return res.status(400).json({ error: 'ID_REQUIRED' });
            }
            
            const context = this._buildContext(req);
            
            const updated = await this.crud.service.update(_id, updateData, context);
            res.json(updated);
          } catch (error) {
            this._handleError(error, res);
          }
        };
        
      case 'delete':
        return async (req, res) => {
          try {
            const data = req.verified || req.query || req.body;
            const { _id } = data;
            
            if (!_id) {
              return res.status(400).json({ error: 'ID_REQUIRED' });
            }
            
            const context = this._buildContext(req);
            
            await this.crud.service.delete(_id, context);
            res.status(204).send();
          } catch (error) {
            this._handleError(error, res);
          }
        };
        
      default:
        // Для кастомных действий
        return async (req, res) => {
          try {
            const customHandler = this.crud.service.getCustomHandler(actionName);
            if (!customHandler) {
              return res.status(404).json({ error: 'ACTION_NOT_FOUND' });
            }
            
            await customHandler.call(this.crud, req, res);
          } catch (error) {
            this._handleError(error, res);
          }
        };
    }
  }

  // Создание контекста из request
  _buildContext(req) {
    return {
      userId: req.userId,
      user: req.user,
      organizationId: req.organizationId,
      roles: req.roles || [],
      permissions: req.permissions || [],
      abacContext: req.abacContext || {},
      ip: req.ip,
      userAgent: req.get('user-agent'),
      isServiceRequest: req.isServiceRequest || false,
      ...req.context // Дополнительный контекст
    };
  }

  // Обработка ошибок
  _handleError(error, res) {
    if (res.headersSent) return;

    
    console.log(error)
    
    const statusCode = error.statusCode || error.code === 'NOT_FOUND' ? 404 : 500;
    const message = error.message || 'Internal Server Error';
    
    res.status(statusCode).json({
      error: message,
      code: error.code
    });
  }

  // Создание middleware для верификации
  _createVerifierMiddleware(method, actionName) {
    const verifier = this.crud.core.getVerifier(actionName);
    if (!verifier) return null;
    
    // Определяем что проверять
    const verifyTarget = this._getVerificationTarget(method, actionName);
    if (!verifyTarget) return null;
    
    return (req, res, next) => {
      const data = verifyTarget === 'query' ? req.query : req.body;
      const result = verifier.verify ? verifier.verify(data) : verifier.validate(data);
      
      if (!result.isValid) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          field: verifyTarget,
          errors: result.verificationErrors || result.errors
        });
      }
      
      // Сохраняем верифицированные данные
      console.log('verified result', result)
      req.verified = result.verifiedData || data;
      next();
    };
  }

  // Определение цели верификации
  _getVerificationTarget(method, actionName) {
    // Для стандартных CRUD операций
    if (['create', 'update', 'delete'].includes(actionName)) {
      return 'body';
    }
    if (['read'].includes(actionName)) {
      return 'query';
    }
    
    // Для кастомных действий определяем по методу HTTP
    if (['post', 'put', 'patch'].includes(method)) {
      return 'body';
    }
    if (['get', 'delete'].includes(method)) {
      return 'query';
    }
    
    return null;
  }

  // Обертка handler для after middleware
  _wrapHandler(handler, actionName) {
    return async (req, res, next) => {
      try {
        // Вызываем основной handler
        await handler(req, res, next);
        
        // Применяем after middleware если ответ еще не отправлен
        if (!res.headersSent) {
          const afterMiddlewares = this.getMiddlewares('after', actionName);
          for (const mw of afterMiddlewares) {
            await new Promise((resolve, reject) => {
              mw(req, res, (err) => err ? reject(err) : resolve());
            });
          }
        }
      } catch (error) {
        next(error);
      }
    };
  }

  // Получение информации о роутах
  getRoutes() {
    return Array.from(this.routes.entries()).map(([key, value]) => ({
      key,
      ...value
    }));
  }

  // Удаление роута
  removeRoute(method, path) {
    const key = `${method.toUpperCase()} ${this.crud.basePath}${path}`;
    return this.routes.delete(key);
  }

  // Проверка существования роута
  hasRoute(method, path) {
    const key = `${method.toUpperCase()} ${this.crud.basePath}${path}`;
    return this.routes.has(key);
  }
}

export default CRUDController;