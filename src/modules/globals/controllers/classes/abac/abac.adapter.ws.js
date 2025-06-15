// @martyrs/src/modules/globals/controllers/classes/abac/abac.adapter.ws.js
export default class ABACWebSocketAdapter {
  constructor(abac) {
    this.abac = abac;
  }

  handler(moduleName, options = {}) {
    return async (ws, message) => {
      try {
        const { action = 'access', resource = moduleName } = options;
        
        const context = {
          user: ws.userId,
          resource,
          action,
          data: message,
          socket: ws,
          customPolicies: options.policies || {}
        };

        const accessResult = await this.abac.checkAccess(context, context.customPolicies);
        
        if (!accessResult.allow) {
          ws.send(JSON.stringify({
            type: 'error',
            error: {
              code: 'ACCESS_DENIED',
              message: accessResult.reason
            }
          }));
          return false;
        }

        return true;
      } catch (error) {
        console.error('WebSocket access control error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Access control error'
          }
        }));
        return false;
      }
    };
  }

  // Метод для RPC вызовов через WebSocket
  rpcHandler(module, method, options = {}) {
    return async (params, context) => {
      const abacContext = {
        user: context.userId,
        resource: module,
        action: method,
        data: params,
        socket: context.ws,
        customPolicies: options.policies || {}
      };

      const accessResult = await this.abac.checkAccess(abacContext, abacContext.customPolicies);
      
      if (!accessResult.allow) {
        throw new Error(accessResult.reason);
      }

      // Проверка полей если нужно
      if (options.checkFields && params) {
        const fieldsResult = await this.abac.checkFields(abacContext, params, method);
        if (fieldsResult.denied.length > 0) {
          if (options.strictFieldsMode) {
            throw new Error(`Fields access denied: ${fieldsResult.denied.map(d => d.path).join(', ')}`);
          }
          // Возвращаем только разрешенные поля
          return fieldsResult.allowed;
        }
        // Возвращаем трансформированные данные если есть
        return fieldsResult.transformed || params;
      }

      return params;
    };
  }
}