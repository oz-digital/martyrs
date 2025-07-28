import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import Observer from '@martyrs/src/modules/globals/controllers/classes/globals.observer.js';

// Update quantity in stockAvailability
export async function updateStockQuantity(db, product, variant, storage, quantity, owner, creator, session) {
  return await db.stockAvailability.findOneAndUpdate(
    { product, variant, storage },
    { 
      $inc: { quantity },
      $setOnInsert: {
        owner,
        creator,
        available: 0,
        constraints: []
      }
    },
    { upsert: true, new: true, session }
  );
}

// Collect affected variants for recalculation
export async function collectAffectedVariants(db, products, variants, session) {
  const affectedVariants = new Set();
  
  // Add direct variants
  variants?.forEach(v => {
    if (v) affectedVariants.add(v.toString());
  });
  
  // Find dependent variants
  if (products?.length) {
    const dependentVariants = await db.variant.find({
      'ingredients._id': { $in: products },
      'ingredients.optional': { $ne: true }
    }).distinct('_id').session(session);
    
    dependentVariants.forEach(v => affectedVariants.add(v.toString()));
  }
  
  return Array.from(affectedVariants);
}

// Batch recalculate availability
export async function recalculateAvailability(db, logger, variantIds, storage, session) {
  const variants = await db.variant.find({
    _id: { $in: variantIds }
  }).session(session).lean();
  
  if (!variants.length) return;
  
  const allIngredientIds = new Set();
  variants.forEach(v => {
    v.ingredients?.forEach(ing => {
      allIngredientIds.add(ing._id.toString());
    });
  });
  
  const availabilities = await db.stockAvailability.find({
    storage,
    $or: [
      { variant: { $in: variantIds } },
      { product: { $in: Array.from(allIngredientIds) } }
    ]
  }).session(session).lean();
  
  const quantityByVariant = new Map();
  const quantityByProduct = new Map();
  
  availabilities.forEach(a => {
    if (a.variant) {
      quantityByVariant.set(a.variant.toString(), a.quantity);
    } else if (a.product) {
      quantityByProduct.set(a.product.toString(), a.quantity);
    }
  });
  
  const bulkOps = [];
  
  variants.forEach(variant => {
    const variantId = variant._id.toString();
    const directStock = quantityByVariant.get(variantId) || 0;
    
    let available = directStock > 0 ? directStock : Infinity;
    const constraints = [];
    
    if (variant.ingredients?.length) {
      for (const ing of variant.ingredients) {
        if (ing.optional) continue;
        
        const stock = quantityByProduct.get(ing._id.toString()) || 0;
        const canMake = Math.floor(stock / (ing.quantity || 1));
        
        if (directStock === 0 || canMake < available) {
          available = canMake;
        }
        
        constraints.push({
          ingredient: ing._id,
          stock,
          required: ing.quantity,
          available: canMake
        });
      }
    }
    
    if (available === Infinity) {
      available = directStock;
    }
    
    bulkOps.push({
      updateOne: {
        filter: { variant: variant._id, storage },
        update: {
          $set: {
            product: variant.product,
            available,
            constraints,
            calculatedAt: new Date()
          },
          $setOnInsert: {
            quantity: directStock,
            owner: variant.owner,
            creator: variant.creator
          }
        },
        upsert: true
      }
    });
  });
  
  if (bulkOps.length) {
    await db.stockAvailability.bulkWrite(bulkOps, { session });
    
    // Check alerts
    for (const variant of variants) {
      const variantId = variant._id.toString();
      const available = quantityByVariant.get(variantId) || 0;
      
      const alerts = await db.stockAlert.find({
        product: variant.product,
        enabled: true,
        $or: [
          { variant: null, storage: null },
          { variant: null, storage: storage },
          { variant: variant._id, storage: null },
          { variant: variant._id, storage: storage }
        ]
      }).session(session);
      
      for (const alert of alerts) {
        if (available < alert.threshold) {
          try {
            await fetch(`${process.env.API_URL || ''}/api/notifications`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Service-Key': process.env.SERVICE_KEY,
              },
              body: JSON.stringify({
                title: 'Low Stock Alert',
                body: `Stock for ${variant.name || 'Product'} is low: ${available} units remaining (threshold: ${alert.threshold})`,
                type: 'stock_alert',
                metadata: {
                  alertId: alert._id,
                  productId: variant.product,
                  variantId: variant._id,
                  storageId: storage,
                  currentStock: available,
                  threshold: alert.threshold
                },
                userId: alert.creator.target
              })
            });
          } catch (notificationError) {
            logger.error('Error sending stock alert notification:', notificationError);
          }
        }
      }
    }
  }
}

export function invalidateCache(cache, logger, tags) {
  setImmediate(() => {
    cache.delByTags(tags).catch(err => 
      logger.error('Cache invalidation error', err)
    );
  });
}

// Initialize change streams for variant updates
export function initChangeStreams(db, logger, recalculateAvailability, invalidateCache) {
  const variantStream = db.variant.watch([], { fullDocument: 'updateLookup' });
  
  variantStream.on('change', async (change) => {
    if (change.operationType === 'update' && 
        change.updateDescription?.updatedFields?.ingredients) {
      
      const variantId = change.documentKey._id;
      
      const storages = await db.stockAvailability.distinct('storage', {
        variant: variantId
      });
      
      for (const storage of storages) {
        await recalculateAvailability(db, logger, [variantId], storage);
      }
      
      invalidateCache(['availability']);
    }
  });
  
  variantStream.on('error', err => {
    logger.error('Variant change stream error', err);
  });
}