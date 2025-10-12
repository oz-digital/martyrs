import coreabac from './controllers/classes/abac/abac.js';

import initCorePolicies from './controllers/policies/core.policies.js';

const { getInstance } = coreabac;

// Ленивая загрузка WebSocketManager через асинхронную фабрику
let _WebSocketManagerClass = null;

async function createWebSocketManager(...args) {
  if (!_WebSocketManagerClass) {
    const module = await import('./controllers/classes/core.websocket.js');
    _WebSocketManagerClass = module.default;
  }
  return new _WebSocketManagerClass(...args);
}

// Для обратной совместимости экспортируем как WebSocketManager
const WebSocketManager = createWebSocketManager;

function initializeCore(app, db, origins, publicPath) {
  // Определяем модель Log только здесь
  db.log =
    db.mongoose.models.Log ||
    db.mongoose.model(
      'Log',
      new db.mongoose.Schema(
        {
          timestamp: { type: Date, default: Date.now },
          level: String,
          message: String,
        },
        { versionKey: false }
      )
    );
  const abac = getInstance(db);
  const corePolicies = initCorePolicies(abac);
}
export { WebSocketManager, initializeCore as initialize };
export default {
  initialize: initializeCore,
  WebSocketManager,
};
