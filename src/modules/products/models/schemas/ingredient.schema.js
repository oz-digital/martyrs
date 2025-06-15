export default db => {
  const IngredientSchema = new db.mongoose.Schema({
    _id: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Price cannot be less than 0'],
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Price cannot be less than 0'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1'],
    },
    unit: {
      type: String,
      required: true,
      default: 'g',
    },
    optional: {
      type: Boolean,
      default: false,
      description: 'Является ли ингредиент опциональным',
    },
    replaceable: {
      type: Boolean,
      default: false,
      description: 'Можно ли заменить ингредиент',
    },
    alternatives: [{
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      description: 'Альтернативные продукты для замены',
    }],
  });
  return IngredientSchema;
};
