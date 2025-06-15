import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';
export default db => {
  const OrderSchema = new db.mongoose.Schema(
    {
      customer: {
        type: {
          type: String,
          required: true,
        },
        target: {
          type: db.mongoose.Schema.Types.ObjectId,
          refPath: 'customer.type',
          required: true,
        },
      },
      positions: {
        type: Array,
      },
      referralCode: {
        type: String,
      },
      status: {
        type: String,
      },
      deadline: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 60000), // Добавляет 30 минут к текущему времени
      },
      status_history: [
        {
          status: {
            type: String,
            trim: true,
          },
          user: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          comment: {
            type: String,
            trim: true,
          },
        },
      ],
      comment: {
        type: String,
        trim: true,
      },
      payment: {
        type: {
          type: String,
          trim: true,
          default: 'cash',
        },
        status: {
          type: String,
          trim: true,
          default: 'unpaid',
        },
      },
      delivery: {
        type: {
          type: String,
          trim: true,
        },
        address: {
          type: String,
          trim: true,
        },
        spot: {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          trim: true,
        },
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    }
  );
  applyOwnershipSchema(OrderSchema, db);
  const Order = db.mongoose.model('Order', OrderSchema);
  return Order;
};
