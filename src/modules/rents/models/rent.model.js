export default (db, additionalFields = {}) => {
  const RentSchema = new db.mongoose.Schema({
    order: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    product: { type: db.mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: { type: db.mongoose.Schema.Types.ObjectId, ref: 'Variant', default: null },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'canceled'],
      default: 'pending',
    },
    creator: {
      type: {
        type: String,
        enum: ['user', 'organization', 'customer', 'User', 'Organization', 'Customer'],
        required: true,
      },
      target: { type: db.mongoose.Schema.Types.ObjectId, required: true },
    },
    owner: {
      type: {
        type: String,
        enum: ['user', 'organization', 'customer', 'User', 'Organization', 'Customer'],
        required: true,
      },
      target: { type: db.mongoose.Schema.Types.ObjectId, required: true },
    },
    comment: { type: String, default: '' },
    ...additionalFields,
  });
  return db.mongoose.model('Rent', RentSchema);
};
