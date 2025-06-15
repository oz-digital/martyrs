import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

export default db => {
  const StockBalanceSchema = new db.mongoose.Schema({
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
    quantity: {
      type: Number,
      default: 0,
    }
  }, {
    timestamps: {
      currentTime: () => Date.now(),
    },
  });

  applyOwnershipSchema(StockBalanceSchema, db);

  // Add proper composite index for lookups
  StockBalanceSchema.index({product: 1, variant: 1, storage: 1}, {unique: true});
  
  // Add individual indexes for common lookups
  StockBalanceSchema.index({updatedAt: -1});
  StockBalanceSchema.index({ storage: 1, variant: 1 });
  StockBalanceSchema.index({ storage: 1, product: 1 });
  StockBalanceSchema.index({ quantity: -1 });


  const StockBalance = db.mongoose.model('StockBalance', StockBalanceSchema);
  return StockBalance;
};