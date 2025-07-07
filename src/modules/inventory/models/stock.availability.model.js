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
      required: true,
    },
    storage: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Spot',
      required: true,
    },
    // Computed availability
    quantity: {
      type: Number,
      default: 0,
    },
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
  }, {
    timestamps: {
      currentTime: () => Date.now(),
    },
  });

  // Create indexes for efficient querying
  StockAvailabilitySchema.index(
    { product: 1, variant: 1, storage: 1 },
    { unique: true }
  );
  StockAvailabilitySchema.index({ storage: 1 });
  StockAvailabilitySchema.index({ available: -1 }); 
  
  const StockAvailability = db.mongoose.model('StockAvailability', StockAvailabilitySchema);
  return StockAvailability;
};