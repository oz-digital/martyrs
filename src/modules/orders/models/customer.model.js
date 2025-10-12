import applyCredentialsSchema from '@martyrs/src/modules/core/models/schemas/credentials.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/core/models/schemas/ownership.schema.js';
import applyProfileSchema from '@martyrs/src/modules/core/models/schemas/profile.schema.js';
export default db => {
  const CustomerSchema = new db.mongoose.Schema(
    {
      identity: {
        type: {
          type: String,
          enum: ['Visitor', 'User', 'Organization'],
          required: true,
          // set: toPascalCase
        },
        target: {
          type: db.mongoose.Schema.Types.ObjectId,
          refPath: 'target.type',
        },
      },
      source: {
        type: String,
        enum: ['web', 'mobile', 'api', 'import', 'manual', 'referral', 'social', 'email'],
        default: 'web',
      },
      referral: {
        code: {
          type: String,
        },
        source: {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
        },
      },
      tags: [{
        type: String,
      }],
      notes: {
        type: String,
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'active',
      },
      address: {
        country: {
          type: String,
        },
        addressLine1: {
          type: String,
          required: true,
        },
        addressLine2: {
          type: String,
        },
        city: {
          type: String,
        },
        postalCode: {
          type: String,
        },
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    }
  );
  applyCredentialsSchema(CustomerSchema, db);
  applyProfileSchema(CustomerSchema, db);
  applyOwnershipSchema(CustomerSchema, db);
 

  CustomerSchema.index(
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
  CustomerSchema.index(
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
  CustomerSchema.index(
    {
      owner: 1,
      identity: 1,
    },
    {
      unique: true,
      partialFilterExpression: {
        identity: { $exists: true, $ne: '' },
      },
    }
  );
  const Customer = db.mongoose.model('Customer', CustomerSchema);
  return Customer;
};

