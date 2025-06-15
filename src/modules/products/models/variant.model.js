import applyCommonSchema from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

import ingredientSchema from './schemas/ingredient.schema.js';

export default db => {
  const IngredientSchema = ingredientSchema(db);

  const VariantSchema = new db.mongoose.Schema({
    _id: {
      type: db.mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    product: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sku: {
      type: String,
      trim: true,
    },
    images: {
      type: Array,
    },
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    cost: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      default: 'pcs',
      enum: ['pcs', 'g', 'kg', 'ml', 'l', 'oz'],
    },
    ingredients: [
      IngredientSchema
    ],
    attributes: [{
      name: { type: String },
      value: { type: String },
    }],
  },{
    timestamps: {
      currentTime: () => Date.now(),
    },
  });

  applyCommonSchema(VariantSchema, db);
  applyOwnershipSchema(VariantSchema, db);

  VariantSchema.index({ Variant: 1, name: 1 });

  const Variant = db.mongoose.model('Variant', VariantSchema);

  return Variant;
};
