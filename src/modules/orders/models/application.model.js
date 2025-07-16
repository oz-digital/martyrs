import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';

export default db => {
  const ApplicationSchema = new db.mongoose.Schema(
    {
      status: {
        type: String,
        default: 'created',
      },
      type: {
        type: String,
        default: 'newsletter',
      },
      contacts: {
        name: {
          type: String,
        },
        phone: {
          type: String,
        },
        email: {
          type: String,
        },
      },
      text: {
        type: String,
      },
      chat: {
        type: String,
      },
      customer: {
        type: {
          type: String,
          enum: ['Customer'],
        },
        target: {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
        },
      },
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );

  applyOwnershipSchema(ApplicationSchema, db);

  const Application = db.mongoose.model('Application', ApplicationSchema);
  return Application;
};
