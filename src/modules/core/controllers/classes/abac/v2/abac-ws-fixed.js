// @martyrs/src/modules/core/controllers/classes/abac/abac.adapter.ws.js
export default class ABACWebSocketAdapter {
  constructor(abac) {
    this.abac = abac;
  }

  /**
   * WebSocket handler для проверки доступа
   * @param {string} moduleName - Имя модуля
   * @param {Object} [options] - Опции
   * @returns {Function} Handler функция
   */
  handler(moduleName, options = {}) {
    return async (ws, message) => {
      try {
        const { action = 'access', resource = moduleName } = options;
        
        const context = this._buildContext(ws, resource, action, message, options);
        const accessResult = await this.abac.checkAccess(context, context.customPolicies);
        
        if (!accessResult.allow) {
          await this._sendError(ws, 'ACCESS_DENIED', accessResult.reason);
          return false;
        }

        // Проверка полей если включена
        if (options.checkFields && message) {
          const fieldsResult = await this.abac.checkFields(context, message, action);
          
          if (fieldsResult.errors.length > 0 && options.strictFieldsMode) {
            await this._sendError(ws, 'FIELD_VALIDATION_ERROR', 'Field validation failed', {
              fields: fieldsResult.errors
            });
            return false;
          }
          
          // Возвращаем отфильтрованные данные
          return {
            allowed: true,
            data: fieldsResult.transformed || fieldsResult.allowed,
            fieldsResult
          };
        }

        return true;
      } catch (error) {
        this.abac.logger?.error('WebSocket access control error', {
          module: moduleName,
          error: error.message,
          stack: error.stack
        });
        
        await this._sendError(ws, 'INTERNAL_ERROR', 'Access control error');
        return false;
      }
    };
  }

  /**
   * RPC handler для вызовов через WebSocket
   * @param {string} module - Модуль
   * @param {string} method - Метод
   * @param {Object} [options] - Опции
   * @returns {Function} RPC handler
   */
  rpcHandler(module, method, options = {}) {
    return async (params, rpcContext) => {
      try {
        const context = this._buildRPCContext(rpcContext, module, method, params, options);
        const accessResult = await this.abac.checkAccess(context, context.customPolicies);
        
        if (!accessResult.allow) {
          throw new RPCError('ACCESS_DENIED', accessResult.reason);
        }

        // Проверка полей если нужно
        if (options.checkFields && params) {
          const fieldsResult = await this.abac.checkFields(context, params, method);
          
          if (fieldsResult.errors.length > 0) {
            if (options.strictFieldsMode) {
              throw new RPCError(
                'FIELD_VALIDATION_ERROR',
                `Fields validation failed: ${fieldsResult.errors.map(e => e.path).join(', ')}`
              );
            }
            
            // Логируем ошибки в нестрогом режиме
            this.abac.logger?.warn('RPC field validation errors', {
              module,
              method,
              errors: fieldsResult.errors
            });
          }
          
          // Возвращаем трансформированные данные
          return fieldsResult.transformed || fieldsResult.allowed;
        }

        return params;
      } catch (error) {
        // Пробрасываем RPC ошибки как есть
        if (error instanceof RPCError) {
          throw error;
        }
        
        this.abac.logger?.error('RPC access control error', {
          module,
          method,
          error: error.message,
          stack: error.stack
        });
        
        throw new RPCError('INTERNAL_ERROR', 'Access control error');
      }
    };
  }

  /**
   * Middleware для обработки WebSocket сообщений
   * @param {Object} [options] - Опции
   * @returns {Function} Middleware функция
   */
  messageMiddleware(options = {}) {
    return async (ws, message, next) => {
      try {
        const { resource = 'message', action = 'send' } = options;
        const context = this._buildContext(ws, resource, action, message, options);
        
        const accessResult = await this.abac.checkAccess(context, options.policies || {});
        
        if (!accessResult.allow) {
          await this._sendError(ws, 'ACCESS_DENIED', accessResult.reason);
          return;
        }
        
        // Сохраняем результат в контексте WS
        ws.abacContext = context;
        ws.abacAccessResult = accessResult;
        
        next();
      } catch (error) {
        this.abac.logger?.error('WebSocket middleware error', {
          error: error.message
        });
        
        await this._sendError(ws, 'INTERNAL_ERROR', 'Access control error');
      }
    };
  }

  /**
   * Построение контекста для WebSocket
   * @private
   */
  _buildContext(ws, resource, action, data, options) {
    return {
      user: ws.userId || ws.user?.id,
      resource,
      action,
      data: data || {},
      socket: ws,
      customPolicies: options.policies || {},
      options,
      // Дополнительная информация о соединении
      connectionInfo: {
        id: ws.id,
        remoteAddress: ws._socket?.remoteAddress,
        protocol: ws.protocol,
        readyState: ws.readyState
      }
    };
  }

  /**
   * Построение контекста для RPC
   * @private
   */
  _buildRPCContext(rpcContext, module, method, params, options) {
    return {
      user: rpcContext.userId || rpcContext.user?.id,
      resource: module,
      action: method,
      data: params || {},
      socket: rpcContext.ws,
      customPolicies: options.policies || {},
      options,
      rpcInfo: {
        id: rpcContext.id,
        module,
        method,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Отправка ошибки через WebSocket
   * @private
   */
  async _sendError(ws, code, message, details = {}) {
    if (ws.readyState !== 1) { // WebSocket.OPEN
      return;
    }
    
    try {
      const errorMessage = JSON.stringify({
        type: 'error',
        error: {
          code,
          message,
          ...details
        },
        timestamp: new Date().toISOString()
      });
      
      ws.send(errorMessage);
    } catch (error) {
      this.abac.logger?.error('Failed to send WebSocket error', {
        originalError: { code, message },
        sendError: error.message
      });
    }
  }
}

/**
 * Класс для RPC ошибок
 */
class RPCError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'RPCError';
    this.code = code;
    this.details = details;
  }
}