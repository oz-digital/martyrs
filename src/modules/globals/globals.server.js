import globalsabac from '@martyrs/src/modules/globals/controllers/classes/abac/abac.js';

import initGlobalsPolicies from './controllers/policies/globals.policies.js';

const { getInstance } = globalsabac;

// Ленивая загрузка WebSocketManager через асинхронную фабрику
let _WebSocketManagerClass = null;

async function createWebSocketManager(...args) {
  if (!_WebSocketManagerClass) {
    const module = await import('@martyrs/src/modules/globals/controllers/classes/globals.websocket.js');
    _WebSocketManagerClass = module.default;
  }
  return new _WebSocketManagerClass(...args);
}

// Для обратной совместимости экспортируем как WebSocketManager
const WebSocketManager = createWebSocketManager;

function initializeGlobals(app, db, origins, publicPath) {
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
  const globalsPolicies = initGlobalsPolicies(abac);
}
export { WebSocketManager, initializeGlobals as initialize };
export default {
  initialize: initializeGlobals,
  WebSocketManager,
};
