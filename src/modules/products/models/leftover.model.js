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

  LeftoverSchema.index({ storage: 1, order: 1, type: 1 });

  const Leftover = db.mongoose.model('Leftover', LeftoverSchema);

  return Leftover;
};
