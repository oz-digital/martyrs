import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import queryProcessor from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';

const availabilityServiceFactory = db => {
  const cache = new Cache({ ttlSeconds: 300 });
  const logger = new Logger(db);
  
  // Helper function to collect affected variants for recalculation
  const collectAffectedVariants = async (products, variants, session) => {
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
  };

  // Main recalculation function
  const recalculateAvailability = async (variantIds, storage, session) => {
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
  };

  // Cache invalidation helper
  const invalidateCache = (tags) => {
    setImmediate(() => {
      cache.delByTags(tags).catch(err => 
        logger.error('Cache invalidation error', err)
      );
    });
  };

  // Initialize change streams for variant updates
  const initChangeStreams = () => {
    const variantStream = db.variant.watch([], { fullDocument: 'updateLookup' });
    
    variantStream.on('change', async (change) => {
      if (change.operationType === 'update' && 
          change.updateDescription?.updatedFields?.ingredients) {
        
        const variantId = change.documentKey._id;
        
        const storages = await db.stockAvailability.distinct('storage', {
          variant: variantId
        });
        
        for (const storage of storages) {
          await recalculateAvailability([variantId], storage);
        }
        
        invalidateCache(['availability']);
      }
    });
    
    variantStream.on('error', err => {
      logger.error('Variant change stream error', err);
    });
  };

  // Don't initialize here - will be called from inventory.server.js
  
  return {
    // Public API for reading availability
    async read(req, res) {
      try {
        console.log('=== AVAILABILITY DEBUG ===');
        console.log('req.query:', req.query);
        console.log('req.verifiedQuery:', req.verifiedQuery);
        console.log('req.verifiedQuery?.details:', req.verifiedQuery?.details);
        
        if (!req.verifiedQuery) {
          console.log('WARNING: req.verifiedQuery is undefined, converting from req.query');
          req.verifiedQuery = {
            ...req.query,
            skip: parseInt(req.query.skip) || 0,
            limit: parseInt(req.query.limit) || 20
          };
        }
        
        const cacheKey = JSON.stringify({ type: 'availability', ...req.verifiedQuery });
        let data = await cache.get(cacheKey);
        
        if (!data) {
          const needsDetails = req.verifiedQuery?.details === 'true';
          
          const matchConditions = {};
          if (req.verifiedQuery?.owner) {
            matchConditions['owner.target'] = new db.mongoose.Types.ObjectId(req.verifiedQuery.owner);
          }
          if (req.verifiedQuery?.product) {
            matchConditions._id = new db.mongoose.Types.ObjectId(req.verifiedQuery.product);
          }
          if (req.verifiedQuery?.search) {
            matchConditions.name = { $regex: req.verifiedQuery.search, $options: 'i' };
          }
          
          const pipeline = [
            { $match: matchConditions },
            {
              $lookup: {
                from: 'stockavailabilities',
                let: { pid: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$product', '$$pid'] },
                      ...(req.verifiedQuery?.storage && {
                        storage: new db.mongoose.Types.ObjectId(req.verifiedQuery.storage)
                      })
                    }
                  }
                ],
                as: 'availability'
              }
            },
            { $skip: req.verifiedQuery?.skip || 0 },
            { $limit: req.verifiedQuery?.limit || 20 },
            {
              $addFields: {
                available: { $sum: '$availability.available' },
                totalStock: { $sum: '$availability.quantity' },
                storageCount: { $size: '$availability' }
              }
            }
          ];
          
          if (needsDetails) {
            pipeline.push(
              {
                $lookup: {
                  from: 'products',
                  let: { pid: '$product' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$pid'] } } },
                    {
                      $project: {
                        name: 1,
                        sku: 1,
                        unit: 1
                      }
                    }
                  ],
                  as: 'productInfo'
                }
              },
              {
                $unwind: {
                  path: '$productInfo',
                  preserveNullAndEmptyArrays: true
                }
              }
            );
          }
          
          data = await db.product.aggregate(pipeline).exec();
          await cache.setWithTags(cacheKey, data, ['availability']);
        }
        
        res.json(data);
      } catch (error) {
        logger.error('Error reading availability', error);
        res.status(500).json({ message: error.message });
      }
    },
    
    // Internal methods for other services
    recalculateAvailability,
    collectAffectedVariants,
    invalidateCache,
    initChangeStreams,
    cache,
    logger
  };
};

export default availabilityServiceFactory;