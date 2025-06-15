class GlobalWebSocket {
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
    this.subscribedModules = new Set(); // <--- ключевое изменение
  }

  initialize(options = {}) {
    this.maxReconnectAttempts = options.maxReconnectAttempts || this.maxReconnectAttempts;
    this.reconnectDelay = options.reconnectDelay || this.reconnectDelay;
    this.baseUrl = options.wsUrl || this._getDefaultWsUrl();
    this.pingIntervalTime = options.pingInterval || this.pingIntervalTime;
  }

  _getDefaultWsUrl() {
    if (typeof window === 'undefined') return '/api/ws';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws`;
  }

  connect(userId) {
    if (typeof window === 'undefined') return Promise.resolve(false);
    this.userId = userId;

    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.socket);
    }

    this.connectPromise = new Promise((resolve, reject) => {
      this.disconnect();

      const wsUrl = userId ? `${this.baseUrl}?userId=${encodeURIComponent(userId)}` : this.baseUrl;
      this.socket = new WebSocket(wsUrl);

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

    this.isConnected = false;
    this.userId = null;
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
    if (!moduleName || this.subscribedModules.has(moduleName)) return;
    const success = await this.send({ type: 'subscribe', module: moduleName });
    if (success) {
      this.subscribedModules.add(moduleName);
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

    this._resubscribeAllModules(); // <--- ВАЖНО
    this._notifyListeners('open', { isConnected: true });
  }

  _handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
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
  }

  _handleClose(event) {
    this.isConnected = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this._notifyListeners('close', { code: event.code, reason: event.reason });

    if (event.code !== 1000 && this.userId && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
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
}

const globalWebSocket = new GlobalWebSocket();
export default globalWebSocket;
