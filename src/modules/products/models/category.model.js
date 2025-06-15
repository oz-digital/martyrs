import common from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import engagement from '@martyrs/src/modules/globals/models/schemas/engagement.schema.js';
import metadata from '@martyrs/src/modules/globals/models/schemas/metadata.schema.js';
import ownership from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

export default db => {
  const CategorySchema = new db.mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      photo: { type: String },
      order: { type: Number, required: true },
      url: { type: String, required: true, trim: true, unique: true },
      parent: { type: db.mongoose.Schema.Types.ObjectId, ref: 'Category' },
      localization: { type: Array },
      filters: { type: Array },
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );
  // Применяем глобальные схемы
  common(CategorySchema, db);
  ownership(CategorySchema, db);
  metadata(CategorySchema, db);
  engagement(CategorySchema, db);
  CategorySchema.index({ parent: 1 });
  CategorySchema.index({ name: 1 });
  const Category = db.mongoose.model('Category', CategorySchema, 'categories');
  return Category;
};
