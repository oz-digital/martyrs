import CRUD from '@martyrs/src/modules/globals/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/globals/controllers/classes/abac/abac.js';

import verifierFactory from '../middlewares/variants.verifier.js';

const { getInstance } = ABAC;

export default function setupVariantsRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = verifierFactory(db);

  const variantsCRUD = new CRUD({
    app,
    db,
    model: db.variant,
    modelName: 'variant',
    basePath: '/api/variants',

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
      tags: ['variant', 'inventory']
    },
    
    events: {
      enabled: true,
      logReads: false
    }
  });

  return variantsCRUD;
}