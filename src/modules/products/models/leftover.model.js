import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

export default db => {
  const LeftoverSchema = new db.mongoose.Schema(
    {
      type: {
        type: String,
        enum: ['stock-in', 'stock-out', 'write-off'],
        default: 'stock-in',
        required: true,
      },
      order: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      storage: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Spot',
      },
      positions: [{
        _id: {
          type: db.mongoose.Schema.Types.ObjectId,
        },
        product: {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        variant: {
          _id: {
            type: db.mongoose.Schema.Types.ObjectId,
          },
          name: {
            type: String,
          },
          attributes: {
            type: Array,
          },
        },
        image: {
          type: String,
        },
        name: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        cost: {
          type: Number,
        },
        unit: {
          type: String,
        }
      }],
      comment: {
        type: String,
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    }
  );

  applyOwnershipSchema(LeftoverSchema, db);

  // Существующий составной индекс
  LeftoverSchema.index({ storage: 1, order: 1, type: 1 });
  
  // Текстовый индекс для поиска по позициям
  LeftoverSchema.index({ 'positions.name': 'text', comment: 'text' });
  
  // Основные составные индексы (покрывают префиксные запросы)
  LeftoverSchema.index({ 'owner.type': 1, 'owner.target': 1, type: 1, storage: 1 });
  LeftoverSchema.index({ 'owner.type': 1, 'owner.target': 1, createdAt: -1 });
  LeftoverSchema.index({ 'owner.type': 1, 'owner.target': 1, updatedAt: -1 });
  LeftoverSchema.index({ type: 1, 'owner.type': 1, 'owner.target': 1, createdAt: -1 });
  LeftoverSchema.index({ type: 1, storage: 1 });
  LeftoverSchema.index({ type: 1, order: 1 });
  LeftoverSchema.index({ type: 1, createdAt: -1 });
  LeftoverSchema.index({ type: 1, updatedAt: -1 });
  LeftoverSchema.index({ type: 1, 'positions._id': 1 });
  
  // Индексы для позиций с составными
  LeftoverSchema.index({ 'positions._id': 1, type: 1, createdAt: -1 });
  LeftoverSchema.index({ storage: 1, 'positions._id': 1, type: 1 });
  LeftoverSchema.index({ storage: 1, createdAt: -1 });
  LeftoverSchema.index({ order: 1, type: 1 });
  LeftoverSchema.index({ order: 1, createdAt: -1 });
  
  // Индексы для позиций
  LeftoverSchema.index({ 'positions._id': 1 });
  LeftoverSchema.index({ 'positions.product': 1 });
  LeftoverSchema.index({ 'positions.variant._id': 1 });
  LeftoverSchema.index({ 'positions.name': 1 });
  
  // Отдельные индексы для полей без префиксов в составных
  LeftoverSchema.index({ createdAt: -1 });
  LeftoverSchema.index({ updatedAt: -1 });

  const Leftover = db.mongoose.model('Leftover', LeftoverSchema);

  return Leftover;
};
