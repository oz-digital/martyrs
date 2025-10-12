import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';
import stockAlertsVerifierFactory from '../middlewares/stock.alerts.verifier.js';

const { getInstance } = ABAC;

export default function setupStockAlertsRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = stockAlertsVerifierFactory(db);

  // Основной CRUD для stock alerts
  const stockAlertsCRUD = new CRUD({
    app,
    db,
    model: db.stockAlert,
    modelName: 'stockAlert',
    basePath: '/api/inventory/alerts',
    
    auth: true,
    
    verifiers: {
      create: verifier.createVerifier,
      read: verifier.readVerifier,
      update: verifier.updateVerifier,
      delete: verifier.deleteVerifier
    },
    
    abac: abac,
    
    cache: {
      enabled: true,
      ttl: 300,
      tags: ['stockAlerts', 'inventory']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  return stockAlertsCRUD;
}