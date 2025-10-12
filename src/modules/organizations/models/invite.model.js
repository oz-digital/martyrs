import applyCredentialsSchema from '@martyrs/src/modules/core/models/schemas/credentials.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/core/models/schemas/ownership.schema.js';
export default db => {
  const InviteSchema = new db.mongoose.Schema(
    {
      code: {
        type: String,
        required: true,
        unique: true,
      },
      status: {
        type: String,
        enum: ['active', 'used', 'deactivated'],
        default: 'active',
      },
      role: {
        type: String,
        default: 'member',
      },
    },
    {
      timestamps: true,
    }
  );
  applyOwnershipSchema(InviteSchema, db);
  applyCredentialsSchema(InviteSchema, db);
  InviteSchema.index(
    {
      owner: 1,
      email: 1,
    },
    {
      unique: true,
      partialFilterExpression: {
        email: { $exists: true, $ne: '' },
      },
    }
  );
  InviteSchema.index(
    {
      owner: 1,
      phone: 1,
    },
    {
      unique: true,
      partialFilterExpression: {
        phone: { $exists: true, $ne: '' },
      },
    }
  );
  const Invite = db.mongoose.model('Invite', InviteSchema);
  return Invite;
};
