import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import uWS from 'uWebSockets.js';
class WebSocketManager {
  constructor(options = {}) {
    // Создаем uWebSockets.js приложение внутри класса
    if (options.ssl) {
      this.app = uWS.SSLApp({
        key_file_name: options.ssl.key,      // путь к private key
        cert_file_name: options.ssl.cert,    // путь к certificate
        passphrase: options.ssl.passphrase   // если ключ защищен паролем
      });
    } else {
      // Fallback на обычный HTTP для разработки
      this.app = uWS.App();
    };
    this.modules = new Map();
    this.userConnections = new Map();
    // Добавляем контейнер для RPC методов
    this.rpcMethods = new Map();
    // Настраиваем WebSocket обработчик
    this.app.ws('/api/ws', {
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 120,
      compression: uWS.SHARED_COMPRESSOR,
      maxBackpressure: 1024 * 1024,
      // Обработчик аутентификации и апгрейда соединения
      upgrade: (res, req, context) => {
        let userId = null;
        // Получаем cookies и все необходимые заголовки из HTTP-запроса
        const headers = {};
        req.forEach((key, value) => {
          headers[key.toLowerCase()] = value;
        });
        // Собираем заголовки для WebSocket-протокола один раз
        const secWebSocketKey = headers['sec-websocket-key'] || '';
        const secWebSocketProtocol = headers['sec-websocket-protocol'] || '';
        const secWebSocketExtensions = headers['sec-websocket-extensions'] || '';
        try {
          if (headers.cookie) {
            const cookies = cookie.parse(headers.cookie);
            if (cookies.user) {
              const token = JSON.parse(decodeURIComponent(cookies.user));
              const decoded = jwt.verify(token.accessToken, process.env.SECRET_KEY);
              userId = decoded._id;
            }
          }
        } catch (err) {
          console.error('Invalid token:', err);
        }
        // Если авторизация требуется, но userId не найден - отклоняем соединение
        if (process.env.REQUIRE_AUTH === 'true' && !userId) {
          res.writeStatus('401 Unauthorized').end('Authentication required');
          return;
        }
        const userData = { userId };
        res.upgrade(userData, secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, context);
      },
      // Обработчик открытия соединения
      open: ws => {
        // Инициализация свойств клиента
        ws.userId = ws.getUserData().userId;
        ws.subscriptions = new Set();
        // Отслеживаем соединение, если есть userId
        if (ws.userId) {
          this._trackUserConnection(ws.userId, ws);
        }
      },
      // Обработчик входящих сообщений
      message: async (ws, message, isBinary) => {
        if (!isBinary) {
          try {
            // Более эффективная обработка ArrayBuffer
            const msgStr = new TextDecoder().decode(message);
            const msg = JSON.parse(msgStr);
            // Обработка подписки и отписки на модуль
            if (msg.type === 'subscribe' && msg.module && this.modules.has(msg.module)) {
              ws.subscriptions.add(msg.module);
              return;
            } else if (msg.type === 'unsubscribe' && msg.module) {
              ws.subscriptions.delete(msg.module);
              return;
            }
            // Обработка RPC вызова
            if (msg.type === 'rpc') {
              await this._handleRpcCall(ws, msg);
              return;
            }
            // Маршрутизация сообщения к соответствующему обработчику модуля
            const moduleName = msg.module;
            if (moduleName && this.modules.has(moduleName)) {
              const handler = this.modules.get(moduleName);
              Promise.resolve(handler(ws, msg)).catch(err => {
                console.error(`Error in handler for module ${moduleName}:`, err);
              });
            }
          } catch (err) {
            console.error('Invalid message or handler error:', err);
            // Отправляем ошибку обратно клиенту
            if (err instanceof Error) {
              try {
                ws.send(
                  JSON.stringify({
                    type: 'error',
                    error: {
                      message: err.message,
                      code: err.code || 'INTERNAL_ERROR',
                    },
                  }),
                  false
                );
              } catch (sendErr) {
                console.error('Error sending error response:', sendErr);
              }
            }
          }
        }
      },
      // Обработчик закрытия соединения
      close: (ws, code, message) => {
        const userId = ws.userId;
        if (userId && this.userConnections.has(userId)) {
          this.userConnections.get(userId).delete(ws);
          if (this.userConnections.get(userId).size === 0) {
            this.userConnections.delete(userId);
          }
        }
        // Очищаем подписки для предотвращения утечки памяти
        if (ws.subscriptions && typeof ws.subscriptions.clear === 'function') {
          ws.subscriptions.clear();
        }
      },
    });
    // Запускаем сервер на порту, если порт указан
    this.listenSocket = null;
  }
  // Метод для запуска сервера
  listen(port, callback) {
    this.app.listen('0.0.0.0', port, listenSocket => {
      if (listenSocket) {
        this.listenSocket = listenSocket;
        if (callback) callback(null, this.app);
      } else {
        if (callback) callback(new Error('Failed to listen'), null);
      }
    });
    return this;
  }
  _trackUserConnection(userId, ws) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId).add(ws);
  }
  registerModule(moduleName, handler) {
    this.modules.set(moduleName, handler);
  }
  // Добавляем методы для регистрации RPC
  registerRpcMethod(moduleName, methodName, handler, options = {}) {
    const fullMethodName = `${moduleName}.${methodName}`;
    if (!this.rpcMethods.has(moduleName)) {
      this.rpcMethods.set(moduleName, new Map());
    }
    this.rpcMethods.get(moduleName).set(methodName, {
      handler,
      options: {
        requireAuth: options.requireAuth !== false, // По умолчанию true
        validateParams: options.validateParams || null,
        rateLimit: options.rateLimit || null,
        ...options,
      },
    });
    console.log(`RPC method registered: ${fullMethodName}`);
    return this;
  }
  // Метод для регистрации группы RPC методов из модуля
  registerRpcMethods(moduleName, methodsMap) {
    for (const [methodName, config] of Object.entries(methodsMap)) {
      const handler = typeof config === 'function' ? config : config.handler;
      const options = typeof config === 'function' ? {} : config.options || {};
      this.registerRpcMethod(moduleName, methodName, handler, options);
    }
    return this;
  }
  // Обработчик RPC вызовов
  async _handleRpcCall(ws, message) {
    const { module, method, params, id } = message;
    // Проверяем, что такой метод зарегистрирован
    if (!this.rpcMethods.has(module) || !this.rpcMethods.get(module).has(method)) {
      this._sendRpcResponse(ws, id, null, {
        code: -32601,
        message: `Method ${module}.${method} not found`,
      });
      return;
    }
    const { handler, options } = this.rpcMethods.get(module).get(method);
    // Проверка авторизации
    if (options.requireAuth && !ws.userId) {
      this._sendRpcResponse(ws, id, null, {
        code: -32000,
        message: 'Authentication required',
      });
      return;
    }
    // Валидация параметров
    if (options.validateParams && !options.validateParams(params)) {
      this._sendRpcResponse(ws, id, null, {
        code: -32602,
        message: 'Invalid params',
      });
      return;
    }
    // Выполняем метод
    try {
      // Создаем контекст для выполнения метода
      const context = {
        userId: ws.userId,
        ws,
        sendResponse: result => this._sendRpcResponse(ws, id, result),
        sendError: error => this._sendRpcResponse(ws, id, null, error),
      };
      const result = await handler.call(context, params, context);
      // Отправляем ответ, если он не был отправлен внутри обработчика
      if (!context.responseSent) {
        this._sendRpcResponse(ws, id, result);
      }
    } catch (error) {
      console.error(`Error executing RPC method ${module}.${method}:`, error);
      this._sendRpcResponse(ws, id, null, {
        code: -32603,
        message: error.message || 'Internal error',
      });
    }
  }
  // Отправка ответа на RPC запрос
  _sendRpcResponse(ws, id, result, error = null) {
    // Предотвращаем повторную отправку ответа
    if (ws.context?.responseSent) return;
    if (ws.context) ws.context.responseSent = true;
    // Формируем и отправляем ответ
    const response = {
      type: 'rpc_response',
      id,
    };
    if (error) {
      response.error = {
        code: error.code || -32603,
        message: error.message || 'Internal error',
        data: error.data,
      };
    } else {
      response.result = result;
    }
    try {
      ws.send(JSON.stringify(response), false);
    } catch (err) {
      console.error('Error sending RPC response:', err);
    }
  }
  sendToUserInModule(moduleName, userId, data) {
    const userIdStr = userId.toString();
    const sockets = this.userConnections.get(userIdStr);
    if (!sockets) {
      console.log(`No sockets found for user ${userIdStr}`);
      return false;
    }
    let sent = false;
    const message = JSON.stringify(data);
    for (const ws of sockets) {
      if (ws.subscriptions.has(moduleName)) {
        try {
          const ok = ws.send(message, false); // false = not binary
          if (!ok) {
            console.warn('WebSocket backpressure exceeded for user:', userIdStr);
            // Можно здесь добавить логику для обработки перегрузки соединения
          } else {
            sent = true;
          }
        } catch (err) {
          console.warn('Failed to send message to user:', userIdStr, err);
          // Возможно, сокет уже закрыт, но не удален из списка
        }
      }
    }
    return sent;
  }
  broadcastToModule(moduleName, data) {
    const message = JSON.stringify(data);
    let failedSends = 0;
    // Итерируем через наши отслеживаемые соединения
    for (const sockets of this.userConnections.values()) {
      for (const ws of sockets) {
        if (ws.subscriptions.has(moduleName)) {
          try {
            const ok = ws.send(message, false);
            if (!ok) {
              failedSends++;
            }
          } catch (err) {
            failedSends++;
            console.warn('Failed to broadcast message:', err);
          }
        }
      }
    }
    if (failedSends > 0) {
      console.warn(`Failed to send broadcast to ${failedSends} connections due to backpressure or closed sockets`);
    }
    return true;
  }
  broadcastToModuleWithFilter(moduleName, filterFn, data) {
    const message = JSON.stringify(data);
    let failedSends = 0;
    for (const sockets of this.userConnections.values()) {
      for (const ws of sockets) {
        if (!ws.subscriptions.has(moduleName)) continue;
        if (!filterFn(ws)) continue;
        try {
          const ok = ws.send(message, false);
          if (!ok) {
            failedSends++;
          }
        } catch (err) {
          failedSends++;
          console.warn('Failed to send filtered broadcast:', err);
        }
      }
    }
    if (failedSends > 0) {
      console.warn(`Failed to send filtered broadcast to ${failedSends} connections due to backpressure or closed sockets`);
    }
    return true;
  }
  getServer() {
    return this.app;
  }
}
export default WebSocketManager;
