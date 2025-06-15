import CRUD from '@martyrs/src/modules/globals/controllers/classes/crud/crud.js';
import ABAC from '@martyrs/src/modules/globals/controllers/classes/abac/abac.js';

import verifierFactory from '../middlewares/variants.verifier.js';

const { getInstance } = ABAC;

export default function setupVariantsRoutes(app, db) {
  const abac = getInstance(db);
  const verifier = verifierFactory(db);

  // abac.registerFieldsPolicy('variant', {
  //   // SKU редактируют только админы или владельцы организации
  //   'sku': {
  //     actions: ['create', 'update'],
  //     access: async (ctx) => {
  //       // Простая проверка владельца организации
  //       if (await ctx.checkOrganizationOwner()) {
  //         return true;
  //       }
  //       // Проверяем доступ через департаменты
  //       return await ctx.checkOrganizationRight('variant', 'update');
  //     },
  //     rule: 'remove'
  //   },
    
  //   // Cost видят только те, у кого есть специальные права
  //   'cost': {
  //     actions: ['read'],
  //     access: async (ctx) => {
  //       if (!ctx.user) return false;

  //       // Владельцы организации видят cost
  //       if (await ctx.checkOrganizationOwner()) {
  //         return true;
  //       }
        
  //       // Проверяем специальные права в департаментах
  //       const rights = await ctx.getOrganizationRights();
  //       if (!rights) return false;
        
  //       // Проверяем наличие специальных прав
  //       const departments = rights.departments || [];
  //       return departments.some(dept => {
  //         const member = dept.members?.find(m => m.user.toString() === ctx.user._id.toString());
  //         return member?.permissions?.some(p => ['view_costs', 'manage_inventory'].includes(p));
  //       });
  //     },
  //     rule: 'remove'
  //   },
    
  //   // Системные поля
  //   'createdAt': {
  //     actions: ['create', 'update'],
  //     access: 'deny'
  //   },
  //   'updatedAt': {
  //     actions: ['create', 'update'],
  //     access: 'deny'
  //   },
  //   '_id': {
  //     actions: ['create', 'update'],
  //     access: 'deny'
  //   },
  //   '__v': {
  //     actions: ['create', 'update'],
  //     access: 'deny'
  //   }
  // });

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