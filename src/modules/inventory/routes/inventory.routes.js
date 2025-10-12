import jwtFactory from '@martyrs/src/modules/auth/controllers/middlewares/authJwt.js';
import coreabac from '@martyrs/src/modules/core/controllers/classes/core.abac.js';
import adjustmentServiceFactory from '../services/adjustment.service.js';
import availabilityServiceFactory from '../services/availability.service.js';
import auditServiceFactory from '../services/audit.service.js';
import verifierFactory from '../middlewares/inventory.verifier.js';
import setupStockAlertsRoutes from './stock.alerts.routes.js';

const { getInstance } = coreabac;

export default function(app, db) {
  const jwt = jwtFactory(db);
  const verifier = verifierFactory(db);
  const abac = getInstance(db);
  const adjustmentService = adjustmentServiceFactory(db);
  const availabilityService = availabilityServiceFactory(db);
  const auditService = auditServiceFactory(db);
  
  // StockAdjustment routes
  app.get('/api/inventory/adjustments', 
    jwt.verifyToken(true), 
    verifier.verifyAdjustmentQuery, 
    adjustmentService.read
  );
  
  app.post('/api/inventory/adjustments/create', 
    jwt.verifyToken(), 
    verifier.verifyAdjustmentBody, 
    abac.middleware('stockAdjustment', 'create'), 
    adjustmentService.create
  );
  
  // StockAvailability routes
  app.get('/api/inventory/availability', 
    verifier.verifyAvailabilityQuery, 
    availabilityService.read
  );
  
  // StockAudit routes
  app.get('/api/inventory/audits', 
    jwt.verifyToken(), 
    verifier.verifyInventoryQuery, 
    auditService.read
  );
  
  app.post('/api/inventory/audits/create', 
    jwt.verifyToken(), 
    verifier.verifyInventoryBody, 
    abac.middleware('stockAudit', 'create'), 
    auditService.create
  );
  
  app.post('/api/inventory/audits/complete', 
    jwt.verifyToken(), 
    verifier.verifyInventoryComplete, 
    abac.middleware('stockAudit', 'edit'), 
    auditService.complete
  );
  
  // Initialize stock alerts routes
  setupStockAlertsRoutes(app, db);
}