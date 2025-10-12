import applyOwnershipSchema from '@martyrs/src/modules/core/models/schemas/ownership.schema.js';

export default db => {
  const StockAvailabilitySchema = new db.mongoose.Schema({
    product: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
    },
    storage: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Spot',
      required: true,
    },
    // Physical stock quantity (was in StockBalance)
    quantity: {
      type: Number,
      default: 0,
    },
    // Computed availability for sale
    available: {
      type: Number,
      default: 0,
    },
    reservations: {
      type: Number,
      default: 0,
    },
    constraints: [{
      ingredient: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      stock: Number,
      required: Number,
      available: Number,
    }],
    calculatedAt: {
      type: Date,
      default: Date.now,
    }
  }, {
    timestamps: {
      currentTime: () => Date.now(),
    },
  });

  applyOwnershipSchema(StockAvailabilitySchema, db);

  // Add proper composite index for lookups (from StockBalance)
  StockAvailabilitySchema.index({product: 1, variant: 1, storage: 1}, {unique: true});
  
  // Add individual indexes for common lookups (from StockBalance)
  StockAvailabilitySchema.index({updatedAt: -1});
  StockAvailabilitySchema.index({ storage: 1, variant: 1 });
  StockAvailabilitySchema.index({ storage: 1, product: 1 });
  StockAvailabilitySchema.index({ quantity: -1 });
  
  // Original availability indexes
  StockAvailabilitySchema.index({ storage: 1 });
  StockAvailabilitySchema.index({ available: -1 }); 
  
  const StockAvailability = db.mongoose.model('StockAvailability', StockAvailabilitySchema);
  return StockAvailability;
};