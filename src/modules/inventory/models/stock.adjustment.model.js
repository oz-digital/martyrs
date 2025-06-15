import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

export default db => {
  const StockAdjustmentSchema = new db.mongoose.Schema({
    product: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: true,
    },
    storage: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Spot',
      required: true,
    },
    source: {
      type: {
        type: String,
        required: true,
        enum: ['User', 'Order', 'Inventory'],
      },
      target: {
        type: db.mongoose.Schema.Types.ObjectId,
        refPath: 'source.type'
      },
    },
    reason: { 
      type: String,
      enum: ['restock', 'sale', 'return', 'damage', 'transfer', 'custom' ],
      required: true,
    },
    comment: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
    },
  },{
    timestamps: {
      currentTime: () => Date.now(),
    },
  });

  applyOwnershipSchema(StockAdjustmentSchema, db);

  StockAdjustmentSchema.index({ product: 1, variant: 1, storage: 1 });
  StockAdjustmentSchema.index({ storage: 1 });
  StockAdjustmentSchema.index({ storage:1, createdAt:-1 });
  StockAdjustmentSchema.index({ product:1, createdAt:-1 });
  StockAdjustmentSchema.index({ reason: 1, createdAt:-1 });

  const StockAdjustment = db.mongoose.model('StockAdjustment', StockAdjustmentSchema);

  return StockAdjustment;
};