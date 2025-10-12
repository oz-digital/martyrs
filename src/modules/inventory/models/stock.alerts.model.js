import applyOwnershipSchema from '@martyrs/src/modules/core/models/schemas/ownership.schema.js';

export default db => {
  const StockAlertSchema = new db.mongoose.Schema({
    product: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      default: null, // null = все варианты
    },
    storage: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Spot',
      default: null, // null = все склады
    },
    threshold: {
      type: Number,
      required: true,
      min: 0,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  }, {
    timestamps: {
      currentTime: () => Date.now(),
    },
  });

  applyOwnershipSchema(StockAlertSchema, db);

  // Индексы для быстрого поиска
  StockAlertSchema.index({ product: 1, enabled: 1 });
  StockAlertSchema.index({ product: 1, variant: 1, storage: 1 });
  StockAlertSchema.index({ 'owner.target': 1 });

  const StockAlert = db.mongoose.model('StockAlert', StockAlertSchema);

  return StockAlert;
};