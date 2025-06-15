import StockAdjustmentModel from './models/stockAdjustment.model.js';
import StockBalanceModel from './models/stockBalance.model.js';
import StockAvailabilityModel from './models/stockAvailability.model.js';
import StockInventoryModel from './models/stockInventory.model.js';
import inventoryRoutes from './routes/inventory.routes.js';
import inventoryPolicies from './policies/inventory.policies.js';

function initializeInventory(app, db, origins, publicPath) {
  // Регистрация моделей
  db.stockAdjustment = StockAdjustmentModel(db);
  db.stockBalance = StockBalanceModel(db);
  db.stockAvailability = StockAvailabilityModel(db);
  db.stockInventory = StockInventoryModel(db);
  
  // Инициализация маршрутов
  if (app) {
    inventoryRoutes(app, db, origins, publicPath);
    inventoryPolicies(db);
  }
}

export { initializeInventory as initialize };
export default { initialize: initializeInventory };