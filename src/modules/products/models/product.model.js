import applyCommonSchema from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

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
    attributes: [{
      name: { type: String },
      value: { type: String },
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

  ProductSchema.index({ category: 1 });
  ProductSchema.index({ name: 'text', description: 'text' });

  const Product = db.mongoose.model('Product', ProductSchema);

  return Product;
};
