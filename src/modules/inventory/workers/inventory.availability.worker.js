/**
 * Worker for recalculating product availability based on stock balances
 * and ingredient requirements
 */
class AvailabilityWorker {
  constructor(db) {
    this.db = db;
    this.logger = console;
    
    // Initialize change stream if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      this.initChangeStream();
    }
  }
  
  /**
   * Initialize change stream to watch for stock balance changes
   */
  initChangeStream() {
    try {
      const stockBalance = this.db.stockBalance;
      
      stockBalance.collection.watch(
        [{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }],
        { fullDocument: 'updateLookup' } // Critical to get the complete document after updates
      ).on('change', async (event) => {
        try {
          // Only proceed if we have the full document
          if (!event.fullDocument) {
            this.logger.warn('Missing fullDocument in change event, skipping recalculation');
            return;
          }
          
          const { product, storage } = event.fullDocument;
          
          // Process asynchronously to not block the event loop
          process.nextTick(() => {
            this.recalcByProduct(product, storage)
              .catch(err => this.logger.error('Error in change stream recalculation:', err));
          });
        } catch (error) {
          this.logger.error('Error in stock balance change stream:', error);
        }
      });
      
      this.logger.info('Stock balance change stream initialized');
    } catch (error) {
      this.logger.error('Error initializing change stream:', error);
      // If change streams aren't supported, fall back to timer-based updates
      this.initPeriodicUpdates();
    }
  }
  
  /**
   * Fallback method for databases without change stream support
   */
  initPeriodicUpdates() {
    const REFRESH_INTERVAL = 60000; // 1 minute
    
    setInterval(async () => {
      try {
        const stockBalance = this.db.stockBalance;
        
        // Find recently updated balances (in the last interval)
        // Use index on updatedAt for efficient querying
        const recentUpdates = await stockBalance.find({
          updatedAt: { $gte: new Date(Date.now() - REFRESH_INTERVAL * 2) }
        })
        .sort({ updatedAt: -1 })
        .lean();
        
        // Group by product+storage to avoid duplicate recalcs
        const updates = new Map();
        recentUpdates.forEach(balance => {
          const key = `${balance.product.toString()}_${balance.storage.toString()}`;
          updates.set(key, { product: balance.product, storage: balance.storage });
        });
        
        // Process each unique product+storage asynchronously
        for (const { product, storage } of updates.values()) {
          process.nextTick(() => {
            this.recalcByProduct(product, storage)
              .catch(err => this.logger.error('Error in periodic recalculation:', err));
          });
        }
      } catch (error) {
        this.logger.error('Error in periodic availability update:', error);
      }
    }, REFRESH_INTERVAL);
    
    this.logger.info('Periodic availability updates initialized');
  }
  
  /**
   * Recalculate availability for a specific product at a specific storage location
   * 
   * @param {ObjectId} product - Product ID
   * @param {ObjectId} storage - Storage ID
   * @param {ClientSession} [session] - MongoDB session (optional)
   */
  async recalcByProduct(product, storage, session = null) {
    try {
      const Product = this.db.product;
      const StockBalance = this.db.stockBalance;
      const StockAvailability = this.db.stockAvailability;
      
      // Get the product with its variants - using $lookup instead of populate for better performance
      const productData = await Product.aggregate([
        { $match: { _id: this.db.mongoose.Types.ObjectId(product) } },
        {
          $lookup: {
            from: 'variants',
            localField: 'variants',
            foreignField: '_id',
            as: 'variantsData'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            sku: 1,
            ingredients: 1,
            variantsData: {
              _id: 1,
              ingredients: 1
            }
          }
        }
      ]).session(session).then(results => results[0]);
      
      if (!productData) {
        this.logger.warn(`Product ${product} not found for availability recalculation`);
        return;
      }
      
      // Get all variant IDs for this product
      const variantIds = productData.variantsData?.map(v => v._id) || [];
      
      // Add explicit base product (no variant) - better than null for indexing
      const explicitBaseVariantId = '000000000000000000000000'; // ObjectId for base variant
      
      // Get all balances for this product's variants at this storage
      const balances = await StockBalance.find({
        product,
        $or: [
          { variant: { $in: variantIds } },
          { variant: { $exists: false } } // Base product has no variant field
        ],
        storage
      }).session(session).lean();
      
      // Create a map for quick lookup
      const balanceMap = new Map();
      balances.forEach(balance => {
        const key = balance.variant ? balance.variant.toString() : explicitBaseVariantId;
        balanceMap.set(key, balance);
      });
      
      // Get all ingredient IDs from product and variants
      const ingredientIds = new Set();
      
      // Add product's ingredients
      if (productData.ingredients && productData.ingredients.length > 0) {
        productData.ingredients.forEach(ing => ingredientIds.add(ing._id.toString()));
      }
      
      // Add variant's ingredients
      if (productData.variantsData) {
        productData.variantsData.forEach(variant => {
          if (variant.ingredients && variant.ingredients.length > 0) {
            variant.ingredients.forEach(ing => ingredientIds.add(ing._id.toString()));
          }
        });
      }
      
      // Get ingredient balances if needed
      let ingredientBalances = [];
      if (ingredientIds.size > 0) {
        ingredientBalances = await StockBalance.find({
          product: { $in: Array.from(ingredientIds).map(id => this.db.mongoose.Types.ObjectId(id)) },
          storage
        }).session(session).lean();
      }
      
      // Create ingredient balance map
      const ingredientMap = new Map();
      ingredientBalances.forEach(balance => {
        ingredientMap.set(balance.product.toString(), balance);
      });
      
      // Prepare bulk operations for StockAvailability updates
      const bulkOps = [];
      
      // Process base product first
      this._processVariantAvailability(
        bulkOps, 
        product, 
        null, // null variant for base product
        storage,
        productData, 
        balanceMap.get(explicitBaseVariantId), 
        ingredientMap
      );
      
      // Process each variant
      for (const variant of productData.variantsData || []) {
        this._processVariantAvailability(
          bulkOps, 
          product, 
          variant._id, 
          storage,
          variant, 
          balanceMap.get(variant._id.toString()), 
          ingredientMap
        );
      }
      
      // Execute bulk operations
      if (bulkOps.length > 0) {
        const result = await StockAvailability.bulkWrite(bulkOps, { session });
        return result;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error recalculating availability for product ${product}:`, error);
      throw error;
    }
  }
  
  /**
   * Helper to process a single variant's availability
   */
  _processVariantAvailability(bulkOps, productId, variantId, storageId, variant, balance, ingredientMap) {
    // Default values if no balance found
    const stockQuantity = balance ? balance.quantity : 0;
    
    // Start with direct stock
    let availableQuantity = stockQuantity;
    
    // Track ingredient constraints
    const constraints = [];
    
    // Process ingredients if they exist
    if (variant.ingredients && variant.ingredients.length > 0) {
      for (const ingredient of variant.ingredients) {
        const ingId = ingredient._id.toString();
        const requiredQty = ingredient.quantity || 0;
        
        // Skip optional ingredients
        if (ingredient.optional) continue;
        
        const ingBalance = ingredientMap.get(ingId);
        const stockIng = ingBalance ? ingBalance.quantity : 0;
        
        // Calculate how many products can be made with this ingredient
        if (requiredQty > 0) {
          const possibleQty = Math.floor(stockIng / requiredQty);
          
          // Track ingredient constraint
          constraints.push({
            ingredient: ingredient._id,
            stock: stockIng,
            required: requiredQty,
            available: possibleQty
          });
          
          // Take the minimum between current available and what ingredients allow
          availableQuantity = Math.min(availableQuantity, possibleQty);
        }
      }
    }
    
    // Ensure available doesn't go negative
    availableQuantity = Math.max(0, availableQuantity);
    
    // Create update operation
    bulkOps.push({
      updateOne: {
        filter: {
          product: productId,
          variant: variantId,
          storage: storageId
        },
        update: {
          $set: {
            quantity: stockQuantity,
            available: availableQuantity,
            constraints,
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    });
  }
}

export default AvailabilityWorker;