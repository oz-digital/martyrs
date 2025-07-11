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
      
      // 7. Проверяем алерты
      for (const variant of variants) {
        const variantId = variant._id.toString();
        const available = balanceByVariant.get(variantId) || 0;
        
        // Найти алерты для этого варианта/продукта/склада
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
            // Отправить уведомление
            try {
              await fetch(`${process.env.API_URL || ''}/api/notifications`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Service-Key': process.env.SERVICE_KEY,
                },
                body: JSON.stringify({
                  title: 'Low Stock Alert',
                  body: `Stock is low: ${available} units (threshold: ${alert.threshold})`,
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
              // Continue execution, don't fail if notification fails
            }
          }
        }
      }
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
          creator: req.verifiedBody.creator || { type: 'user', target: req.userId },
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
        console.log(error)
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
        console.log('=== AVAILABILITY DEBUG ===');
        console.log('req.query:', req.query);
        console.log('req.verifiedQuery:', req.verifiedQuery);
        console.log('req.verifiedQuery?.details:', req.verifiedQuery?.details);
        
        // Если verifiedQuery не установлен, конвертируем типы из query
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
          // Thin DTO by default, heavy joins optional
          const needsDetails = req.verifiedQuery?.details === 'true';
          
          // Начинаем с products чтобы показать ВСЕ товары, даже с нулевым stock
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
                let: { productId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$product', '$$productId'] },
                      ...(req.verifiedQuery?.storage && { storage: new db.mongoose.Types.ObjectId(req.verifiedQuery.storage) })
                    }
                  }
                ],
                as: 'availability'
              }
            },
            {
              $addFields: {
                available: { $sum: '$availability.available' },
                totalStock: { $sum: '$availability.quantity' },
                storageCount: { $size: '$availability' }
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
            { $limit: req.verifiedQuery?.limit || 20 },
            { $skip: req.verifiedQuery?.skip || 0 }
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
        
        const data = await db.stockAudit.aggregate(stages).exec();
        res.json(data);
      } catch (error) {
        logger.error('Error reading inventories', error);
        res.status(500).json({ message: error.message });
      }
    },
    
    async create(req, res) {
      const session = await db.mongoose.startSession();
      session.startTransaction();
      
      try {
        const inventoryData = {
          ...req.verifiedBody,
          creator: { type: 'user', target: req.userId },
          owner: req.verifiedBody.owner
        };
        
        const audit = await db.stockAudit.create([inventoryData], { session });
        
        // Если status = 'published', сразу выполняем complete логику
        if (req.verifiedBody.status === 'published') {
          const auditDoc = audit[0];
          
          // Создаем StockAdjustment для каждой позиции
          const adjustmentPromises = auditDoc.positions.map(position => {
            return db.stockAdjustment.create([{
              product: position.product,
              variant: position.variant,
              storage: auditDoc.storage,
              source: { type: 'Inventory', target: auditDoc._id },
              reason: position.reason || 'custom',
              comment: position.comment,
              quantity: position.quantity,
              cost: position.cost,
              creator: auditDoc.creator,
              owner: auditDoc.owner
            }], { session });
          });
          
          await Promise.all(adjustmentPromises);
          
          // Обновляем StockBalance
          const balanceOps = auditDoc.positions.map(p => ({
            updateOne: {
              filter: {
                product: p.product,
                variant: p.variant || null,
                storage: auditDoc.storage
              },
              update: {
                $inc: { quantity: p.quantity },
                $setOnInsert: {
                  owner: auditDoc.owner,
                  creator: auditDoc.creator
                }
              },
              upsert: true
            }
          }));
          
          await db.stockBalance.bulkWrite(balanceOps, { session });
          
          // Пересчитываем StockAvailability
          const affectedVariants = new Set();
          const affectedProducts = new Set();
          
          auditDoc.positions.forEach(p => {
            if (p.variant) affectedVariants.add(p.variant.toString());
            affectedProducts.add(p.product.toString());
          });
          
          const dependentVariants = await db.variant.find({
            'ingredients._id': { $in: Array.from(affectedProducts) },
            'ingredients.optional': { $ne: true }
          }).distinct('_id').session(session);
          
          dependentVariants.forEach(v => affectedVariants.add(v.toString()));
          
          if (affectedVariants.size) {
            await recalculateAvailability(Array.from(affectedVariants), auditDoc.storage, session);
          }
        }
        
        await session.commitTransaction();
        invalidateCache(['inventories', 'balances', 'availability']);
        
        res.status(201).json(audit[0]);
      } catch (error) {
        await session.abortTransaction();
        logger.error('Error creating inventory', error);
        res.status(500).json({ message: error.message });
      } finally {
        session.endSession();
      }
    },
    
    async complete(req, res) {
      const session = await db.mongoose.startSession();
      session.startTransaction();
      
      try {
        const inventory = await db.stockAudit.findById(req.verifiedBody._id).session(session);
        
        if (!inventory || inventory.status !== 'draft') {
          throw new Error('Invalid inventory status');
        }
        
        // 1. Создаем StockAdjustment для каждой позиции
        const adjustmentPromises = inventory.positions.map(position => {
          return db.stockAdjustment.create([{
            product: position.product,
            variant: position.variant,
            storage: inventory.storage,
            source: { type: 'Inventory', target: inventory._id },
            reason: position.reason || 'custom',
            comment: position.comment,
            quantity: position.quantity,
            cost: position.cost,
            creator: inventory.creator,
            owner: inventory.owner
          }], { session });
        });
        
        await Promise.all(adjustmentPromises);
        
        // 2. Обновляем StockBalance
        const bulkOps = inventory.positions.map(p => ({
          updateOne: {
            filter: {
              product: p.product,
              variant: p.variant || null,
              storage: inventory.storage
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
        
        // 3. Collect all affected variants
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
        
        // 4. Batch recalculate
        if (affectedVariants.size) {
          await recalculateAvailability(
            Array.from(affectedVariants),
            inventory.storage,
            session
          );
        }
        
        // 5. Update inventory status
        inventory.status = 'published';
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