import StockAdjustmentModel from './models/stock.adjustment.model.js';
import StockBalanceModel from './models/stock.balance.model.js';
import StockAvailabilityModel from './models/stock.availability.model.js';
import StockAuditModel from './models/stock.audit.model.js';
import StockAlertModel from './models/stock.alerts.model.js';

import inventoryRoutes from './routes/inventory.routes.js';
import inventoryPolicies from './policies/inventory.policies.js';

function initializeInventory(app, db, origins, publicPath) {
  // Регистрация моделей
  db.stockAdjustment = StockAdjustmentModel(db);
  db.stockBalance = StockBalanceModel(db);
  db.stockAvailability = StockAvailabilityModel(db);
  db.stockAudit = StockAuditModel(db);
  db.stockAlert = StockAlertModel(db);
  
  // Инициализация маршрутов
  if (app) {
    inventoryRoutes(app, db, origins, publicPath);
    inventoryPolicies(db);
  }
}

export { initializeInventory as initialize };
export default { initialize: initializeInventory };