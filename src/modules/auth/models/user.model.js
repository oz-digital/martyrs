import applyCredentialsSchema from '@martyrs/src/modules/core/models/schemas/credentials.schema.js';
import applyProfileSchema from '@martyrs/src/modules/core/models/schemas/profile.schema.js';
import applySocialsSchema from '@martyrs/src/modules/core/models/schemas/socials.schema.js';
export default db => {
  const UserSchema = new db.mongoose.Schema(
    {
      username: {
        type: String,
        sparse: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['active', 'banned', 'removed', 'inactive'],
        default: 'active',
        required: true,
      },
      birthday: {
        type: Date,
        default: null,
      },
      roles: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Role',
        },
      ],
    },
    {
      // Creation Date
      timestamps: {
        currentTime: () => Date.now(),
      },
    }
  );
  applyProfileSchema(UserSchema, db);
  applySocialsSchema(UserSchema, db);
  applyCredentialsSchema(UserSchema, db);
  const User = db.mongoose.model('User', UserSchema);
  return User;
};
