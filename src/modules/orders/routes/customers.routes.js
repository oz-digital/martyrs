import CRUD from '@martyrs/src/modules/core/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/core/controllers/classes/abac/abac.js';

import verifierFactory from '../middlewares/customers.verifier.js';

const { getInstance } = ABAC;

export default function setupCustomersRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = verifierFactory(db);

  const customersCRUD = new CRUD({
    app,
    db,
    model: db.customer,
    modelName: 'customer',
    basePath: '/api/customers',

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
      tags: ['customer', 'orders']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  return customersCRUD;
}