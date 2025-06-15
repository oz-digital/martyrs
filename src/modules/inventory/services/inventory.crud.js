import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import Observer from '@martyrs/src/modules/globals/controllers/classes/globals.observer.js';
import queryProcessor from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';

const controllerFactory = db => {
  const cache = new Cache({ ttlSeconds: 300 });
  const logger = new Logger(db);
  const observer = new Observer();
  
  // Batch recalculate availability
  async function recalculateAvailability(variantIds, storage, session) {
    // 1. Загружаем все варианты одним запросом
    const variants = await db.variant.find({
      _id: { $in: variantIds }
    }).session(session).lean();
    
    if (!variants.length) return;
    
    // 2. Собираем все ID ингредиентов
    const allIngredientIds = new Set();
    const variantMap = new Map();
    
    variants.forEach(v => {
      variantMap.set(v._id.toString(), v);
      v.ingredients?.forEach(ing => {
        allIngredientIds.add(ing._id.toString());
      });
    });
    
    // 3. Загружаем все балансы одним запросом
    const balances = await db.stockBalance.find({
      storage,
      $or: [
        { variant: { $in: variantIds } },
        { product: { $in: Array.from(allIngredientIds) } }
      ]
    }).session(session).lean();
    
    // 4. Индексируем балансы в память
    const balanceByVariant = new Map();
    const balanceByProduct = new Map();
    
    balances.forEach(b => {
      if (b.variant) {
        balanceByVariant.set(b.variant.toString(), b.quantity);
      } else if (b.product) {
        balanceByProduct.set(b.product.toString(), b.quantity);
      }
    });
    
    // 5. Готовим bulk операции
    const bulkOps = [];
    
    variants.forEach(variant => {
      const variantId = variant._id.toString();
      const directStock = balanceByVariant.get(variantId) || 0;
      
      // On-demand support: если прямого стока нет, но есть ингредиенты
      let available = directStock > 0 ? directStock : Infinity;
      const constraints = [];
      
      // Проверяем ингредиенты
      if (variant.ingredients?.length) {
        for (const ing of variant.ingredients) {
          // Пропускаем опциональные ингредиенты
          if (ing.optional) continue;
          
          const stock = balanceByProduct.get(ing._id.toString()) || 0;
          const canMake = Math.floor(stock / (ing.quantity || 1));
          
          // Для on-demand вариантов ограничиваем по ингредиентам
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
      
      // Если это on-demand и нет обязательных ингредиентов
      if (available === Infinity) {
        available = directStock;
      }
      
      bulkOps.push({
        updateOne: {
          filter: { variant: variant._id, storage },
          update: {
            $set: {
              product: variant.product,
              quantity: directStock,
              available,
              constraints,
              calculatedAt: new Date()
            },
            $setOnInsert: {
              owner: variant.owner,
              creator: variant.creator
            }
          },
          upsert: true
        }
      });
    });
    
    // 6. Выполняем bulk update
    if (bulkOps.length) {
      await db.stockAvailability.bulkWrite(bulkOps, { session });
    }
  }
  
  // Fire-and-forget cache invalidation
  function invalidateCache(tags) {
    setImmediate(() => {
      cache.delByTags(tags).catch(err => 
        logger.error('Cache invalidation error', err)
      );
    });
  }
  
  // Change stream для пересчета при изменении рецептов
  function initChangeStreams() {
    const variantStream = db.variant.watch([], { fullDocument: 'updateLookup' });
    
    variantStream.on('change', async (change) => {
      if (change.operationType === 'update' && 
          change.updateDescription?.updatedFields?.ingredients) {
        
        const variantId = change.documentKey._id;
        
        // Найти все склады где есть этот вариант
        const storages = await db.stockBalance.distinct('storage', {
          variant: variantId
        });
        
        // Пересчитать для каждого склада
        for (const storage of storages) {
          await recalculateAvailability([variantId], storage);
        }
        
        invalidateCache(['availability']);
      }
    });
    
    variantStream.on('error', err => {
      logger.error('Variant change stream error', err);
    });
  }
  
  // Инициализация change streams
  initChangeStreams();
  
  // Stock Adjustments controller
  const adjustments = {
    async read(req, res) {
      try {
        const cacheKey = JSON.stringify({ type: 'adjustments', ...req.verifiedQuery });
        let data = await cache.get(cacheKey);
        
        if (!data) {
          const stages = [
            ...queryProcessor.getBasicOptions(req.verifiedQuery),
            ...queryProcessor.getFilterDate(req.verifiedQuery.dateStart, req.verifiedQuery.dateEnd),
            {
              $lookup: {
                from: 'products',
                let: { productId: '$product' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$productId'] } } },
                  { $project: { name: 1, sku: 1 } }
                ],
                as: 'productData'
              }
            },
            { $unwind: { path: '$productData', preserveNullAndEmptyArrays: true } },
            ...queryProcessor.getSortingOptions('createdAt', 'desc'),
            ...queryProcessor.getPaginationOptions(req.verifiedQuery.skip, req.verifiedQuery.limit)
          ];
          
          data = await db.stockAdjustment.aggregate(stages).exec();
          await cache.setWithTags(cacheKey, data, ['adjustments']);
        }
        
        res.json(data);
      } catch (error) {
        logger.error('Error reading adjustments', error);
        res.status(500).json({ message: error.message });
      }
    },
    
    async create(req, res) {
      const session = await db.mongoose.startSession();
      session.startTransaction();
      
      try {
        const adjustmentData = {
          ...req.verifiedBody,
          creator: { type: 'user', target: req.userId },
          owner: req.verifiedBody.owner
        };
        
        // 1. Create adjustment
        const [adjustment] = await db.stockAdjustment.create([adjustmentData], { session });
        
        // 2. Update balance
        const balance = await db.stockBalance.findOneAndUpdate(
          { 
            product: adjustmentData.product,
            variant: adjustmentData.variant,
            storage: adjustmentData.storage
          },
          { 
            $inc: { quantity: adjustmentData.quantity },
            $setOnInsert: {
              owner: adjustmentData.owner,
              creator: adjustmentData.creator
            }
          },
          { upsert: true, new: true, session }
        );
        
        // 3. Collect affected variants
        const affectedVariants = new Set();
        if (adjustmentData.variant) {
          affectedVariants.add(adjustmentData.variant.toString());
        }
        
        // Find variants using this product as ingredient
        const dependentVariants = await db.variant.find({
          'ingredients._id': adjustmentData.product,
          'ingredients.optional': { $ne: true }
        }).distinct('_id').session(session);
        
        dependentVariants.forEach(v => affectedVariants.add(v.toString()));
        
        // 4. Batch recalculate availability
        if (affectedVariants.size) {
          await recalculateAvailability(
            Array.from(affectedVariants),
            adjustmentData.storage,
            session
          );
        }
        
        await session.commitTransaction();
        
        // 5. Fire-and-forget
        invalidateCache(['adjustments', 'balance', 'availability']);
        
        setImmediate(() => {
          observer.notify('stock.adjusted', {
            adjustment,
            balance,
            affectedVariants: Array.from(affectedVariants)
          });
        });
        
        res.status(201).json(adjustment);
      } catch (error) {
        await session.abortTransaction();
        logger.error('Error creating adjustment', error);
        res.status(500).json({ message: error.message });
      } finally {
        session.endSession();
      }
    }
  };
  
  // Stock Balance controller
  const balance = {
    async read(req, res) {
      try {
        const cacheKey = JSON.stringify({ type: 'balance', ...req.verifiedQuery });
        let data = await cache.get(cacheKey);
        
        if (!data) {
          const pipeline = [
            {
              $match: {
                ...(req.verifiedQuery.storage && { storage: new db.mongoose.Types.ObjectId(req.verifiedQuery.storage) }),
                ...(req.verifiedQuery.product && { product: new db.mongoose.Types.ObjectId(req.verifiedQuery.product) }),
                quantity: { $gt: 0 }
              }
            },
            {
              $lookup: {
                from: 'products',
                let: { pid: '$product' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$pid'] } } },
                  { $project: { name: 1, sku: 1 } }
                ],
                as: 'product'
              }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'spots',
                let: { sid: '$storage' },
                pipeline: [
                  { $match: { $expr: { $eq: ['$_id', '$$sid'] } } },
                  { $project: { name: 1, location: 1 } }
                ],
                as: 'storage'
              }
            },
            { $unwind: { path: '$storage', preserveNullAndEmptyArrays: true } },
            { $limit: req.verifiedQuery.limit },
            { $skip: req.verifiedQuery.skip }
          ];
          
          data = await db.stockBalance.aggregate(pipeline).exec();
          await cache.setWithTags(cacheKey, data, ['balance']);
        }
        
        res.json(data);
      } catch (error) {
        logger.error('Error reading balance', error);
        res.status(500).json({ message: error.message });
      }
    }
  };
  
  // Stock Availability controller (optimized)
  const availability = {
    async read(req, res) {
      try {
        const cacheKey = JSON.stringify({ type: 'availability', ...req.verifiedQuery });
        let data = await cache.get(cacheKey);
        
        if (!data) {
          // Thin DTO by default, heavy joins optional
          const needsDetails = req.verifiedQuery.details === 'true';
          
          const pipeline = [
            {
              $match: {
                ...(req.verifiedQuery.storage && { storage: new db.mongoose.Types.ObjectId(req.verifiedQuery.storage) }),
                ...(req.verifiedQuery.product && { product: new db.mongoose.Types.ObjectId(req.verifiedQuery.product) }),
                available: { $gt: 0 }
              }
            }
          ];
          
          // Add joins only if needed
          if (needsDetails) {
            pipeline.push(
              {
                $lookup: {
                  from: 'products',
                  let: { pid: '$product' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$pid'] } } },
                    { $project: { name: 1, sku: 1, price: 1, images: { $slice: ['$images', 1] } } }
                  ],
                  as: 'product'
                }
              },
              { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: 'variants',
                  let: { vid: '$variant' },
                  pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$vid'] } } },
                    { $project: { name: 1, attributes: 1, price: 1 } }
                  ],
                  as: 'variant'
                }
              },
              { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } }
            );
          }
          
          pipeline.push(
            { $sort: { available: -1 } },
            { $limit: req.verifiedQuery.limit },
            { $skip: req.verifiedQuery.skip }
          );
          
          data = await db.stockAvailability.aggregate(pipeline).allowDiskUse(true).exec();
          await cache.setWithTags(cacheKey, data, ['availability']);
        }
        
        res.json(data);
      } catch (error) {
        logger.error('Error reading availability', error);
        res.status(500).json({ message: error.message });
      }
    }
  };
  
  // Stock Inventory controller
  const inventory = {
    async read(req, res) {
      try {
        const stages = [
          ...queryProcessor.getBasicOptions(req.verifiedQuery),
          queryProcessor.getCreatorUserLookupStage(),
          queryProcessor.getAddFieldsCreatorOwnerStage(),
          ...queryProcessor.getSortingOptions('createdAt', 'desc'),
          ...queryProcessor.getPaginationOptions(req.verifiedQuery.skip, req.verifiedQuery.limit)
        ];
        
        const data = await db.stockInventory.aggregate(stages).exec();
        res.json(data);
      } catch (error) {
        logger.error('Error reading inventories', error);
        res.status(500).json({ message: error.message });
      }
    },
    
    async create(req, res) {
      try {
        const inventoryData = {
          ...req.verifiedBody,
          status: 'draft',
          creator: { type: 'user', target: req.userId },
          owner: req.verifiedBody.owner
        };
        
        const inventory = await db.stockInventory.create(inventoryData);
        invalidateCache(['inventories']);
        
        res.status(201).json(inventory);
      } catch (error) {
        logger.error('Error creating inventory', error);
        res.status(500).json({ message: error.message });
      }
    },
    
    async complete(req, res) {
      const session = await db.mongoose.startSession();
      session.startTransaction();
      
      try {
        const inventory = await db.stockInventory.findById(req.verifiedBody._id).session(session);
        
        if (!inventory || inventory.status !== 'draft') {
          throw new Error('Invalid inventory status');
        }
        
        // 1. Bulk update balances
        const bulkOps = inventory.positions.map(p => ({
          updateOne: {
            filter: {
              product: p.product,
              variant: p.variant,
              storage: p.storage
            },
            update: {
              $inc: { quantity: p.quantity },
              $setOnInsert: {
                owner: inventory.owner,
                creator: inventory.creator
              }
            },
            upsert: true
          }
        }));
        
        await db.stockBalance.bulkWrite(bulkOps, { session });
        
        // 2. Collect all affected variants
        const affectedVariants = new Set();
        const affectedProducts = new Set();
        
        inventory.positions.forEach(p => {
          if (p.variant) affectedVariants.add(p.variant.toString());
          affectedProducts.add(p.product.toString());
        });
        
        // Find dependent variants
        const dependentVariants = await db.variant.find({
          'ingredients._id': { $in: Array.from(affectedProducts) },
          'ingredients.optional': { $ne: true }
        }).distinct('_id').session(session);
        
        dependentVariants.forEach(v => affectedVariants.add(v.toString()));
        
        // 3. Batch recalculate
        if (affectedVariants.size) {
          await recalculateAvailability(
            Array.from(affectedVariants),
            inventory.storage,
            session
          );
        }
        
        // 4. Update inventory status
        inventory.status = 'completed';
        await inventory.save({ session });
        
        await session.commitTransaction();
        
        // 5. Fire-and-forget
        invalidateCache(['adjustments', 'balance', 'availability', 'inventories']);
        
        setImmediate(() => {
          observer.notify('inventory.completed', {
            inventory,
            affectedVariants: Array.from(affectedVariants)
          });
        });
        
        res.json(inventory);
      } catch (error) {
        await session.abortTransaction();
        logger.error('Error completing inventory', error);
        res.status(500).json({ message: error.message });
      } finally {
        session.endSession();
      }
    }
  };
  
  return { adjustments, balance, availability, inventory };
};

export default controllerFactory;