import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

export default db => {
  const StockAuditSchema = new db.mongoose.Schema({
    storage: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Spot',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'draft',
    },
    positions: [{
      product: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      variant: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Variant'
      },
      quantity: {
        type: Number,
        required: true
      },
      reason: {
        type: String,
        enum: ['restock', 'sale', 'return', 'damage', 'transfer', 'custom'],
        default: 'custom'
      },
      comment: {
        type: String
      },
      cost: {
        type: Number,
        min: 0
      }
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
  applyOwnershipSchema(StockAuditSchema, db);

  // Create indexes for common lookups
  StockAuditSchema.index({ storage: 1 });
  StockAuditSchema.index({ status: 1, createdAt: -1 });

  const StockAudit = db.mongoose.model('StockAudit', StockAuditSchema);
  return StockAudit;
};