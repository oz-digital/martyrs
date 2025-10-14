class WebSocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.baseUrl = null;
    this.pingInterval = null;
    this.pingIntervalTime = 30000;
    this.listeners = {};
    this.userId = null;
    this.connectPromise = null;
    this.subscribedModules = new Set();

    // RPC-специфичные свойства
    this.rpcCallbacks = new Map();
    this.rpcTimeout = 30000; // 30 секунд таймаут по умолчанию
    this.rpcIdCounter = 0;
  }

  initialize(options = {}) {
    this.maxReconnectAttempts = options.maxReconnectAttempts || this.maxReconnectAttempts;
    this.reconnectDelay = options.reconnectDelay || this.reconnectDelay;
    this.baseUrl = options.wsUrl || this._getDefaultWsUrl();
    this.pingIntervalTime = options.pingInterval || this.pingIntervalTime;
    this.rpcTimeout = options.rpcTimeout || this.rpcTimeout;
  }

   _getDefaultWsUrl() {
    if (typeof window === 'undefined') return '/api/ws';
    
    const isSecure = window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = isSecure ? '' : ':8020';

    return `${protocol}//${host}${port}/api/ws`;
  }

  connect(userId = null) {
    if (typeof window === 'undefined') return Promise.resolve(false);
    this.userId = userId;

    // Проверяем существующее соединение
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      // If already connected but userId changed, need to reconnect
      if (this.userId !== userId) {
        console.log('[WebSocket] UserId changed, reconnecting...');
        return this.reconnectWithAuth(userId);
      }
      return Promise.resolve(this.socket);
    }

    // Предотвращаем создание множества промисов при параллельных вызовах
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise((resolve, reject) => {
      this.disconnect();

      // Используем baseUrl без параметров, так как аутентификация через cookie
      console.log('[WebSocket] Connecting to:', this.baseUrl, 'userId:', userId);
      this.socket = new WebSocket(this.baseUrl);

      this.socket.onopen = () => {
        this._handleOpen();
        resolve(this.socket);
      };

      this.socket.onmessage = this._handleMessage.bind(this);
      this.socket.onerror = err => {
        this._handleError(err);
        reject(err);
      };
      this.socket.onclose = this._handleClose.bind(this);

      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 10000);
    }).finally(() => {
      this.connectPromise = null;
    });

    return this.connectPromise;
  }

  disconnect() {
    if (typeof window === 'undefined') return;

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      this.socket = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Отменяем все ожидающие RPC вызовы
    for (const [id, { reject }] of this.rpcCallbacks.entries()) {
      reject(new Error('WebSocket disconnected'));
      this.rpcCallbacks.delete(id);
    }

    this.isConnected = false;
    this.userId = null;
    this.subscribedModules.clear(); // Очищаем подписки при отключении
  }

  async send(data) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not connected');
      return false;
    }

    try {
      const msg = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(msg);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }

  /**
   * Выполняет RPC вызов на сервере
   * @param {string} module - Имя модуля
   * @param {string} method - Имя метода
   * @param {object} params - Параметры метода
   * @param {object} [options] - Опции вызова
   * @param {number} [options.timeout] - Таймаут в миллисекундах
   * @returns {Promise<any>} - Результат вызова
   */
  rpc(module, method, params = {}, options = {}) {
    if (!this.isConnected || this.socket?.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('WebSocket is not connected'));
    }

    if (!module || !method) {
      return Promise.reject(new Error('Module and method are required'));
    }

    // Генерируем уникальный ID для вызова
    const id = `${++this.rpcIdCounter}`;
    const timeout = options.timeout || this.rpcTimeout;

    return new Promise((resolve, reject) => {
      // Записываем информацию о вызове для последующей обработки ответа
      this.rpcCallbacks.set(id, {
        resolve,
        reject,
        timeoutId: setTimeout(() => {
          if (this.rpcCallbacks.has(id)) {
            this.rpcCallbacks.delete(id);
            reject(new Error(`RPC call to ${module}.${method} timed out after ${timeout}ms`));
          }
        }, timeout),
      });

      // Отправляем RPC запрос
      this.send({
        type: 'rpc',
        module,
        method,
        params,
        id,
      }).catch(err => {
        if (this.rpcCallbacks.has(id)) {
          clearTimeout(this.rpcCallbacks.get(id).timeoutId);
          this.rpcCallbacks.delete(id);
          reject(err);
        }
      });
    });
  }

  addEventListener(eventType, callback, options = {}) {
    const listenerId = `${options.module || 'global'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (!this.listeners[eventType]) this.listeners[eventType] = {};
    this.listeners[eventType][listenerId] = callback;
    return listenerId;
  }

  removeEventListener(eventType, listenerId) {
    if (this.listeners[eventType]?.[listenerId]) {
      delete this.listeners[eventType][listenerId];
    }
  }

  removeModuleListeners(moduleName) {
    Object.keys(this.listeners).forEach(eventType => {
      Object.keys(this.listeners[eventType]).forEach(listenerId => {
        if (listenerId.startsWith(`${moduleName}_`)) {
          delete this.listeners[eventType][listenerId];
        }
      });
    });
  }

  async subscribeModule(moduleName) {
    if (!moduleName) return;
    
    if (this.subscribedModules.has(moduleName)) {
      console.log(`[WebSocket] Module ${moduleName} already subscribed`);
      return;
    }
    
    console.log(`[WebSocket] Subscribing to module: ${moduleName}`);
    const success = await this.send({ type: 'subscribe', module: moduleName });
    if (success) {
      this.subscribedModules.add(moduleName);
      console.log(`[WebSocket] Successfully subscribed to module: ${moduleName}`);
    } else {
      console.log(`[WebSocket] Failed to subscribe to module: ${moduleName}`);
    }
  }

  async unsubscribeModule(moduleName) {
    if (!moduleName || !this.subscribedModules.has(moduleName)) return;
    const success = await this.send({ type: 'unsubscribe', module: moduleName });
    if (success) {
      this.subscribedModules.delete(moduleName);
    }
  }

  _resubscribeAllModules() {
    for (const moduleName of this.subscribedModules) {
      this.send({ type: 'subscribe', module: moduleName });
    }
  }

  _handleOpen() {
    this.isConnected = true;
    this.reconnectAttempts = 0;

    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.pingIntervalTime);

    this._resubscribeAllModules();
    this._notifyListeners('open', { isConnected: true });
  }

  _handleMessage(event) {
    // Проверка на типы сообщений - пропускаем бинарные сообщения
    if (typeof event.data !== 'string') {
      console.warn('Received binary message, but only JSON is supported');
      return;
    }

    try {
      const data = JSON.parse(event.data);

      // Обрабатываем ответы на RPC вызовы
      if (data.type === 'rpc_response' && data.id && this.rpcCallbacks.has(data.id)) {
        const { resolve, reject, timeoutId } = this.rpcCallbacks.get(data.id);
        clearTimeout(timeoutId);
        this.rpcCallbacks.delete(data.id);

        if (data.error) {
          reject(Object.assign(new Error(data.error.message), data.error));
        } else {
          resolve(data.result);
        }

        return;
      }

      // Обрабатываем обычные сообщения
      this._notifyListeners('message', data);
      if (data.type) {
        this._notifyListeners(data.type, data);
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  }

  _handleError(error) {
    console.error('WebSocket error:', error);
    this._notifyListeners('error', { error });

    // Отменяем все RPC вызовы с ошибкой соединения
    for (const [id, { reject, timeoutId }] of this.rpcCallbacks.entries()) {
      clearTimeout(timeoutId);
      reject(new Error('WebSocket connection error'));
      this.rpcCallbacks.delete(id);
    }
  }

  _handleClose(event) {
    this.isConnected = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Отменяем все RPC вызовы при закрытии соединения
    for (const [id, { reject, timeoutId }] of this.rpcCallbacks.entries()) {
      clearTimeout(timeoutId);
      reject(new Error('WebSocket connection closed'));
      this.rpcCallbacks.delete(id);
    }

    this._notifyListeners('close', { code: event.code, reason: event.reason });

    // Reconnect for both authenticated and anonymous users (not just authenticated)
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`[WebSocket] Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect(this.userId).catch(err => {
          console.error('Reconnection failed:', err);
        });
      }, delay);
    }
  }

  _notifyListeners(eventType, data) {
    Object.values(this.listeners[eventType] || {}).forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error(`Listener for ${eventType} failed:`, err);
      }
    });
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Reconnect WebSocket with new authentication
   * Useful when user logs in/out
   * @param {string} userId - New user ID (optional)
   * @returns {Promise<WebSocket|boolean>}
   */
  async reconnectWithAuth(userId) {
    console.log('[WebSocket] Reconnecting with auth, userId:', userId);
    
    // Disconnect existing connection
    this.disconnect();
    
    // Small delay to ensure clean disconnect
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Connect with new userId (or null for anonymous)
    return this.connect(userId);
  }
}

const wsManager = new WebSocketManager();
export { wsManager };
export default wsManager;
