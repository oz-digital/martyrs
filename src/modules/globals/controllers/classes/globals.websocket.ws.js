import jwt from 'jsonwebtoken';
import { WebSocketServer } from 'ws';
class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocketServer({
      server,
      verifyClient: this.verifyClient.bind(this),
    });
    this.modules = new Map();
    this.userConnections = new Map();
    this.wss.on('connection', (ws, req) => {
      ws.userId = req.userId || null;
      ws.subscriptions = new Set();
      if (ws.userId) {
        this._trackUserConnection(ws.userId, ws);
      }
      ws.on('message', async rawMessage => {
        try {
          const msg = JSON.parse(rawMessage);
          // обработка подписки на модуль
          if (msg.type === 'subscribe' && msg.module && this.modules.has(msg.module)) {
            ws.subscriptions.add(msg.module);
            return;
          }
          // нормальная маршрутизация
          const moduleName = msg.module;
          if (moduleName && this.modules.has(moduleName)) {
            const handler = this.modules.get(moduleName);
            await handler(ws, msg);
          }
        } catch (err) {
          console.error('Invalid message or handler error:', err);
        }
      });
      ws.on('close', () => {
        if (ws.userId && this.userConnections.has(ws.userId)) {
          this.userConnections.get(ws.userId).delete(ws);
          if (this.userConnections.get(ws.userId).size === 0) {
            this.userConnections.delete(ws.userId);
          }
        }
      });
    });
  }
  verifyClient(info, done) {
    try {
      const userCookie = info.req.headers.cookie?.split('; ').find(c => c.startsWith('user='));
      if (!userCookie) return done(true);
      const token = JSON.parse(decodeURIComponent(userCookie.replace('user=', '')));
      const decoded = jwt.verify(token.accessToken, process.env.SECRET_KEY);
      info.req.userId = decoded._id;
    } catch (err) {
      console.error('Invalid token:', err);
    }
    done(true);
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
  sendToUserInModule(moduleName, userId, data) {
    const userIdStr = userId.toString();
    const sockets = this.userConnections.get(userIdStr);
    if (!sockets) {
      console.log(`No sockets found for user ${userIdStr}`);
      return false;
    }
    let sent = false;
    for (const ws of sockets) {
      if (ws.readyState === 1 && ws.subscriptions.has(moduleName)) {
        ws.send(JSON.stringify(data));
        sent = true;
      }
    }
    return sent;
  }
  broadcastToModule(moduleName, data) {
    for (const ws of this.wss.clients) {
      if (ws.readyState === 1 && ws.subscriptions.has(moduleName)) {
        ws.send(JSON.stringify(data));
      }
    }
  }
  broadcastToModuleWithFilter(moduleName, filterFn, data) {
    const sockets = this.userConnections;
    for (const ws of this.wss.clients) {
      if (ws.readyState !== 1) continue;
      if (!ws.subscriptions.has(moduleName)) continue;
      if (!filterFn(ws)) continue;
      ws.send(JSON.stringify(data));
    }
  }
  getServer() {
    return this.wss;
  }
}
export default WebSocketManager;
