import jwtFactory from '@martyrs/src/modules/auth/controllers/middlewares/authJwt.js';
import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import controllerFactory from '../services/inventory.crud.js';
import verifierFactory from '../services/inventory.verifier.js';
import setupStockAlertsRoutes from './stock.alerts.routes.js';

const { getInstance } = globalsabac;

export default function(app, db) {
  const jwt = jwtFactory(db);
  const verifier = verifierFactory(db);
  const abac = getInstance(db);
  const controller = controllerFactory(db);
  
  // StockAdjustment routes
  app.get('/api/inventory/adjustments', 
    jwt.verifyToken(true), 
    verifier.verifyAdjustmentQuery, 
    controller.adjustments.read
  );
  
  app.post('/api/inventory/adjustments/create', 
    jwt.verifyToken(), 
    verifier.verifyAdjustmentBody, 
    abac.middleware('stockAdjustment', 'create'), 
    controller.adjustments.create
  );
  
  // StockBalance routes
  app.get('/api/inventory/balance', 
    jwt.verifyToken(true), 
    verifier.verifyBalanceQuery, 
    controller.balance.read
  );
  
  // StockAvailability routes
  app.get('/api/inventory/availability', 
    verifier.verifyAvailabilityQuery, 
    controller.availability.read
  );
  
  // StockInventory routes
  app.get('/api/inventory/audits', 
    jwt.verifyToken(), 
    verifier.verifyInventoryQuery, 
    controller.inventory.read
  );
  
  app.post('/api/inventory/audits/create', 
    jwt.verifyToken(), 
    verifier.verifyInventoryBody, 
    abac.middleware('stockAudit', 'create'), 
    controller.inventory.create
  );
  
  app.post('/api/inventory/audits/complete', 
    jwt.verifyToken(), 
    verifier.verifyInventoryComplete, 
    abac.middleware('stockAudit', 'edit'), 
    controller.inventory.complete
  );
  
  // Initialize stock alerts routes
  setupStockAlertsRoutes(app, db);
}