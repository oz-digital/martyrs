import queryProcessor from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';
import Cache from '@martyrs/src/modules/globals/controllers/classes/globals.cache.js';
import Logger from '@martyrs/src/modules/globals/controllers/classes/globals.logger.js';
import Observer from '@martyrs/src/modules/globals/controllers/classes/globals.observer.js';
import availabilityServiceFactory from './availability.service.js';

const auditServiceFactory = db => {
  const cache = new Cache({ ttlSeconds: 300 });
  const logger = new Logger(db);
  const observer = new Observer();
  const availabilityService = availabilityServiceFactory(db);
  
  // Process inventory positions
  async function processInventoryPositions(audit, session) {
    // Create adjustments
    await Promise.all(
      audit.positions.map(position => 
        db.stockAdjustment.create([{
          product: position.product,
          variant: position.variant,
          storage: audit.storage,
          source: { type: 'Inventory', target: audit._id },
          reason: position.reason || 'custom',
          comment: position.comment,
          quantity: position.quantity,
          cost: position.cost,
          creator: audit.creator,
          owner: audit.owner
        }], { session })
      )
    );
    
    // Update quantities
    await db.stockAvailability.bulkWrite(
      audit.positions.map(p => ({
        updateOne: {
          filter: {
            product: p.product,
            variant: p.variant || null,
            storage: audit.storage
          },
          update: {
            $inc: { quantity: p.quantity },
            $setOnInsert: {
              owner: audit.owner,
              creator: audit.creator,
              available: 0,
              constraints: []
            }
          },
          upsert: true
        }
      })), 
      { session }
    );
    
    // Collect affected items
    const products = audit.positions.map(p => p.product);
    const variants = audit.positions.filter(p => p.variant).map(p => p.variant);
    
    return await availabilityService.collectAffectedVariants(products, variants, session);
  }
  
  return {
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
        
        if (req.verifiedBody.status === 'published') {
          const affectedVariants = await processInventoryPositions(audit[0], session);
          
          if (affectedVariants.length) {
            await availabilityService.recalculateAvailability(affectedVariants, audit[0].storage, session);
          }
        }
        
        await session.commitTransaction();
        availabilityService.invalidateCache(['inventories', 'availability']);
        
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
        
        const affectedVariants = await processInventoryPositions(inventory, session);
        
        if (affectedVariants.length) {
          await availabilityService.recalculateAvailability(affectedVariants, inventory.storage, session);
        }
        
        inventory.status = 'published';
        await inventory.save({ session });
        
        await session.commitTransaction();
        
        availabilityService.invalidateCache(['adjustments', 'availability', 'inventories']);
        
        setImmediate(() => {
          observer.notify('inventory.completed', {
            inventory,
            affectedVariants
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
};

export default auditServiceFactory;