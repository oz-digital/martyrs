import common from '@martyrs/src/modules/core/models/schemas/common.schema.js';
import engagement from '@martyrs/src/modules/core/models/schemas/engagement.schema.js';
import metadata from '@martyrs/src/modules/core/models/schemas/metadata.schema.js';
import ownership from '@martyrs/src/modules/core/models/schemas/ownership.schema.js';

export default db => {
  const CategorySchema = new db.mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      photo: { type: String },
      order: { type: Number, required: true },
      slug: { type: String, required: true, trim: true },
      url: { type: String, required: true, trim: true, unique: true },
      parent: { type: db.mongoose.Schema.Types.ObjectId, ref: 'Category' },
      level: { type: Number, required: true, default: 0 },
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

  // Текстовый индекс для поиска
  CategorySchema.index({ name: 'text', description: 'text' });
  // Основные индексы для фильтрации

  CategorySchema.index({ url: 1, 'owner.target': 1, status: 1, level: 1 });
  CategorySchema.index({ 'owner.type': 1, 'owner.target': 1, status: 1, level: 1 });
  CategorySchema.index({ parent: 1, status: 1, order: 1 });
  CategorySchema.index({ level: 1, status: 1, order: 1 });
  // url уже имеет unique индекс, дополнительный не нужен
  CategorySchema.index({ status: 1, order: 1 });

  const Category = db.mongoose.model('Category', CategorySchema, 'categories');
  return Category;
};
