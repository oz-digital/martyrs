import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';

const { getInstance } = globalsabac;

export default function(db) {
  const abac = getInstance(db);
  
  // Stock Adjustment policies
  // abac.registerResourcePolicy('stockAdjustment', async context => {
  //   const { user, action, data } = context;
    
  //   if (action === 'create') {
  //     // Only warehouse staff can create adjustments
  //     const userDoc = context.userDoc || await db.user.findById(user).populate('roles');
  //     const hasWarehouseRole = userDoc?.roles?.some(r => 
  //       ['warehouse', 'admin', 'moderator'].includes(r.name || r)
  //     );
      
  //     if (!hasWarehouseRole) {
  //       return { allow: false, reason: 'WAREHOUSE_ROLE_REQUIRED' };
  //     }
  //   }
    
  //   return { allow: true, force: false };
  // });
  
  // Stock Inventory policies
  // abac.registerResourcePolicy('stockAudit', async context => {
  //   const { user, action, currentResource } = context;
    
  //   if (action === 'edit' && currentResource) {
  //     // Only creator or admin can complete inventory
  //     if (currentResource.creator.target.toString() !== user) {
  //       const userDoc = context.userDoc || await db.user.findById(user).populate('roles');
  //       const isAdmin = userDoc?.roles?.some(r => r.name === 'admin' || r === 'admin');
        
  //       if (!isAdmin) {
  //         return { allow: false, reason: 'NOT_INVENTORY_CREATOR' };
  //       }
  //     }
  //   }
    
  //   return { allow: true, force: false };
  // });
  
  return abac;
}