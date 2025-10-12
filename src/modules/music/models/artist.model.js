import applyCommonSchema from '@martyrs/src/modules/core/models/schemas/common.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/core/models/schemas/engagement.schema.js';
import applyMetadataSchema from '@martyrs/src/modules/core/models/schemas/metadata.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/core/models/schemas/ownership.schema.js';
import applySocialsSchema from '@martyrs/src/modules/core/models/schemas/socials.schema.js';
export default (function (db) {
  const mongoose = db.mongoose;
  const Schema = mongoose.Schema;
  const ArtistSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      bio: {
        type: String,
        trim: true,
      },
      photoUrl: {
        type: String,
      },
      coverUrl: {
        type: String,
      },
      genre: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Genre',
        },
      ],
      isVerified: {
        type: Boolean,
        default: false,
      },
      website: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
      popularity: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );
  // Apply common schemas
  applyCommonSchema(ArtistSchema, db);
  applyMetadataSchema(ArtistSchema, db);
  applyOwnershipSchema(ArtistSchema, db);
  applySocialsSchema(ArtistSchema, db);
  applyEngagementSchema(ArtistSchema, db);
  // Create indexes
  ArtistSchema.index({ name: 'text', bio: 'text' });
  ArtistSchema.index({ popularity: -1 });
  ArtistSchema.index({ isVerified: 1 });
  return mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);
});
