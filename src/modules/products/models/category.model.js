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

   
  // Текстовый индекс для поиска
  CategorySchema.index({ name: 1 });
  CategorySchema.index({ name: 'text', description: 'text' });
  
  // Основные составные индексы (покрывают префиксные запросы)
  CategorySchema.index({ 'owner.type': 1, 'owner.target': 1, status: 1, parent: 1 });
  CategorySchema.index({ 'owner.type': 1, 'owner.target': 1, order: 1 });
  CategorySchema.index({ parent: 1, status: 1, order: 1 });
  CategorySchema.index({ parent: 1, status: 1, 'owner.type': 1 });
  CategorySchema.index({ parent: 1, name: 1 });
  CategorySchema.index({ parent: 1, createdAt: -1 });
  CategorySchema.index({ parent: 1, updatedAt: -1 });
  
  // Индексы для сортировки без parent
  CategorySchema.index({ status: 1, order: 1 });
  CategorySchema.index({ status: 1, name: 1 });
  CategorySchema.index({ status: 1, createdAt: -1 });
  CategorySchema.index({ status: 1, updatedAt: -1 });
  
  // Специальный индекс для graphLookup
  CategorySchema.index({ _id: 1, parent: 1 });
  
  // Отдельные индексы для полей без префиксов в составных
  CategorySchema.index({ order: 1 });
  CategorySchema.index({ createdAt: -1 });
  CategorySchema.index({ updatedAt: -1 });

  const Category = db.mongoose.model('Category', CategorySchema, 'categories');
  return Category;
};
