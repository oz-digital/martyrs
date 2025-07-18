import applyCommonSchema from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/globals/models/schemas/engagement.schema.js';

import discountschema from './schemas/discount.schema.js';



export default db => {
  const DiscountSchema = discountschema(db);

  const ProductSchema = new db.mongoose.Schema({
    listing: {
      type: String,
      enum: ['sale', 'rent'],
    },
    sku: {
      type: String,
      trim: true,
    },
    category: [{
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Category', 
    }],
    images: {
      type: Array,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    included: {
      type: String
    },
    attributes: [{
      name: { type: String },
      value: { type: String },
    }],
    recommended: [{ 
      type: db.mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    }],
    translations: {
      type: Array,
    },
    discounts: [DiscountSchema]
  },{
    timestamps: {
      currentTime: () => Date.now(),
    },
  });

  applyCommonSchema(ProductSchema, db);
  applyOwnershipSchema(ProductSchema, db);
  applyEngagementSchema(ProductSchema, db);

   // Текстовый индекс для поиска
  ProductSchema.index({ name: 'text', description: 'text' });

  // Основные составные индексы (покрывают префиксные запросы)
  ProductSchema.index({ 'owner.type': 1, 'owner.target': 1, status: 1, category: 1 });
  ProductSchema.index({ category: 1, status: 1, delivery: 1, price: 1 });
  ProductSchema.index({ category: 1, status: 1, price: -1 });
  ProductSchema.index({ category: 1, status: 1, views: -1 });
  ProductSchema.index({ category: 1, status: 1, createdAt: -1 });
  ProductSchema.index({ category: 1, status: 1, updatedAt: -1 });
  ProductSchema.index({ category: 1, delivery: 1, price: 1 });
  
  // Индексы для атрибутов
  ProductSchema.index({ 'attributes.name': 1, 'attributes.value': 1 });
  
  // Индексы для сортировки без категории
  ProductSchema.index({ status: 1, delivery: 1, price: 1 });
  ProductSchema.index({ status: 1, price: -1 });
  ProductSchema.index({ status: 1, views: -1 });
  ProductSchema.index({ status: 1, createdAt: -1 });
  ProductSchema.index({ status: 1, updatedAt: -1 });
  ProductSchema.index({ status: 1, name: 1 });
  ProductSchema.index({ status: 1, 'attributes.name': 1, 'attributes.value': 1 });
  
  // Отдельные индексы для полей без префиксов в составных
  ProductSchema.index({ listing: 1 });
  ProductSchema.index({ recommended: 1 });
  ProductSchema.index({ price: 1 });
  ProductSchema.index({ views: -1 });
  ProductSchema.index({ createdAt: -1 });
  ProductSchema.index({ updatedAt: -1 });

  const Product = db.mongoose.model('Product', ProductSchema);

  return Product;
};
