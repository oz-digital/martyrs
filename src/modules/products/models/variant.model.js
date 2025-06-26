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

  // Существующий индекс
  VariantSchema.index({ Variant: 1, name: 1 });
  
  // Текстовый индекс для поиска
  VariantSchema.index({ name: 'text', sku: 'text' });
  
  // Основные составные индексы (покрывают префиксные запросы)
  VariantSchema.index({ 'owner.type': 1, 'owner.target': 1, product: 1, status: 1 });
  VariantSchema.index({ product: 1, status: 1, price: 1 });
  VariantSchema.index({ product: 1, status: 1, quantity: 1 });
  VariantSchema.index({ product: 1, sku: 1 });
  VariantSchema.index({ product: 1, 'ingredients._id': 1 });
  
  // Индексы для атрибутов
  VariantSchema.index({ 'attributes.name': 1, 'attributes.value': 1 });
  
  // Составные индексы для сортировки
  VariantSchema.index({ status: 1, price: 1 });
  VariantSchema.index({ status: 1, price: -1 });
  VariantSchema.index({ status: 1, quantity: 1 });
  VariantSchema.index({ status: 1, quantity: -1 });
  VariantSchema.index({ status: 1, createdAt: -1 });
  VariantSchema.index({ status: 1, updatedAt: -1 });
  VariantSchema.index({ status: 1, quantity: 1, product: 1 });
  
  // Индексы для ингредиентов
  VariantSchema.index({ 'ingredients._id': 1 });
  VariantSchema.index({ 'ingredients.quantity': 1 });
  
  // Отдельные индексы для полей без префиксов в составных
  VariantSchema.index({ sku: 1 });
  VariantSchema.index({ name: 1 });
  VariantSchema.index({ price: 1 });
  VariantSchema.index({ quantity: 1 });
  VariantSchema.index({ createdAt: -1 });
  VariantSchema.index({ updatedAt: -1 });

  const Variant = db.mongoose.model('Variant', VariantSchema);

  return Variant;
};
