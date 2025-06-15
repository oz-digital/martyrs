import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

export default db => {
  const StockInventorySchema = new db.mongoose.Schema({
    storage: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Spot',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'completed', 'cancelled'],
      default: 'draft',
    },
    positions: [{ 
      type: db.mongoose.Schema.Types.ObjectId, 
      ref: 'StockAdjustment', 
      required: true 
    }],
    comment: {
      type: String,
    },
  }, {
    timestamps: {
      currentTime: () => Date.now(),
    },
  });

  // Apply global schemas
  applyOwnershipSchema(StockInventorySchema, db);

  // Create indexes for common lookups
  StockInventorySchema.index({ storage: 1 });
  StockInventorySchema.index({ status: 1, createdAt: -1 });

  const StockInventory = db.mongoose.model('StockInventory', StockInventorySchema);
  return StockInventory;
};