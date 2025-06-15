export default db => {
  const VariantAvailabilitySchema = new db.mongoose.Schema({
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
  VariantAvailabilitySchema.index(
    { product: 1, variant: 1, storage: 1 },
    { unique: true }
  );
  VariantAvailabilitySchema.index({ storage: 1 });
  VariantAvailabilitySchema.index({ available: -1 }); 
  
  const VariantAvailability = db.mongoose.model('VariantAvailability', VariantAvailabilitySchema);
  return VariantAvailability;
};