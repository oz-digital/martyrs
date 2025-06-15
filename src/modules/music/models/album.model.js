import applyCommonSchema from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/globals/models/schemas/engagement.schema.js';
import applyMetadataSchema from '@martyrs/src/modules/globals/models/schemas/metadata.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';
export default (function (db) {
  const albumSchema = new db.mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: '',
      },
      releaseDate: {
        type: Date,
        required: true,
      },
      coverArt: {
        type: String,
        default: null,
      },
      artists: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Artist',
          required: true,
        },
      ],
      type: {
        type: String,
        enum: ['album', 'single', 'EP', 'compilation'],
        default: 'album',
      },
      genres: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Genre',
        },
      ],
      totalTracks: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );
  // Apply global schemas
  applyOwnershipSchema(albumSchema, db);
  applyMetadataSchema(albumSchema, db);
  applyCommonSchema(albumSchema, db);
  applyEngagementSchema(albumSchema, db);
  // Indexing
  albumSchema.index({ title: 'text', description: 'text' });
  albumSchema.index({ artists: 1 });
  albumSchema.index({ releaseDate: -1 });
  albumSchema.index({ type: 1 });
  albumSchema.index({ genres: 1 });
  return db.mongoose.models.Album || db.mongoose.model('Album', albumSchema);
});
