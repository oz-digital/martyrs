import queryProcessor from '@martyrs/src/modules/core/controllers/utils/queryProcessor.js';
import Cache from '@martyrs/src/modules/core/controllers/classes/core.cache.js';
import Logger from '@martyrs/src/modules/core/controllers/classes/core.logger.js';
import Observer from '@martyrs/src/modules/core/controllers/classes/core.observer.js';
import availabilityServiceFactory from './availability.service.js';

const adjustmentServiceFactory = db => {
  const cache = new Cache({ ttlSeconds: 300 });
  const logger = new Logger(db);
  const observer = new Observer();
  const availabilityService = availabilityServiceFactory(db);
  
  // Update quantity in stockAvailability - local function
  const updateStockQuantity = async (product, variant, storage, quantity, owner, creator, session) => {
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
  };
  
  return {
    async read(req, res) {
      try {
        const cacheKey = JSON.stringify({ type: 'adjustments', ...req.verifiedQuery });
        let data = await cache.get(cacheKey);
        
        if (!data) {
          const stages = [
            ...queryProcessor.getBasicOptions(req.verifiedQuery),
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
                as: 'productData'
              }
            },
            {
              $unwind: {
                path: '$productData',
                preserveNullAndEmptyArrays: true
              }
            },
            queryProcessor.getCreatorUserLookupStage(),
            queryProcessor.getAddFieldsCreatorOwnerStage(),
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
        
        const [adjustment] = await db.stockAdjustment.create([adjustmentData], { session });
        
        const availability = await updateStockQuantity(
          adjustmentData.product,
          adjustmentData.variant,
          adjustmentData.storage,
          adjustmentData.quantity,
          adjustmentData.owner,
          adjustmentData.creator,
          session
        );
        
        const affectedVariants = await availabilityService.collectAffectedVariants(
          [adjustmentData.product],
          adjustmentData.variant ? [adjustmentData.variant] : [],
          session
        );
        
        if (affectedVariants.length) {
          await availabilityService.recalculateAvailability(affectedVariants, adjustmentData.storage, session);
        }
        
        await session.commitTransaction();
        
        availabilityService.invalidateCache(['adjustments', 'availability']);
        
        setImmediate(() => {
          observer.notify('stock.adjusted', {
            adjustment,
            availability,
            affectedVariants
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
};

export default adjustmentServiceFactory;