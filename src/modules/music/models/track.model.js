import createFriendlyURL from '@martyrs/src/modules/globals/controllers/utils/seo-friendly-url.js';
import applyCommonSchema from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/globals/models/schemas/engagement.schema.js';
import applyMetadataSchema from '@martyrs/src/modules/globals/models/schemas/metadata.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';
export default (function (db) {
  const mongoose = db.mongoose;
  const Schema = mongoose.Schema;
  const TrackSchema = new Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      artist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        required: true,
      },
      album: {
        type: Schema.Types.ObjectId,
        ref: 'Album',
      },
      duration: {
        type: Number,
        default: 0,
      },
      fileUrl: {
        type: String,
        required: true,
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
      releaseDate: {
        type: Date,
        default: Date.now,
      },
      isExplicit: {
        type: Boolean,
        default: false,
      },
      lyrics: {
        type: String,
      },
      playCount: {
        type: Number,
        default: 0,
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );
  // Apply common schemas
  applyCommonSchema(TrackSchema, db);
  applyMetadataSchema(TrackSchema, db);
  applyOwnershipSchema(TrackSchema, db);
  applyEngagementSchema(TrackSchema, db);
  // Create indexes for efficient querying
  TrackSchema.index({ title: 'text' });
  TrackSchema.index({ artist: 1 });
  TrackSchema.index({ album: 1 });
  TrackSchema.index({ releaseDate: -1 });
  TrackSchema.index({ playCount: -1 });
  // Pre-save middleware to create a URL if not provided
  TrackSchema.pre('save', function (next) {
    if (!this.url) {
      this.url = createFriendlyURL(`${this.title}-${this._id}`);
    }
    next();
  });
  // Virtual for artist name (useful for APIs)
  TrackSchema.virtual('artistName').get(function () {
    return this.artist ? this.artist.name : '';
  });
  return mongoose.models.Track || mongoose.model('Track', TrackSchema);
});
