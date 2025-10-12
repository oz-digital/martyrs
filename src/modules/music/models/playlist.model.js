import applyCommonSchema from '@martyrs/src/modules/core/models/schemas/common.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/core/models/schemas/engagement.schema.js';
import applyMetadataSchema from '@martyrs/src/modules/core/models/schemas/metadata.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/core/models/schemas/ownership.schema.js';
export default (function (db) {
  const mongoose = db.mongoose;
  const Schema = mongoose.Schema;
  const PlaylistSchema = new Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      coverUrl: {
        type: String,
      },
      tracks: [
        {
          track: {
            type: Schema.Types.ObjectId,
            ref: 'Track',
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      isPublic: {
        type: Boolean,
        default: true,
      },
      followers: {
        type: Number,
        default: 0,
      },
      isCollaborative: {
        type: Boolean,
        default: false,
      },
      collaborators: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );
  // Apply common schemas
  applyCommonSchema(PlaylistSchema, db);
  applyMetadataSchema(PlaylistSchema, db);
  applyOwnershipSchema(PlaylistSchema, db);
  applyEngagementSchema(PlaylistSchema, db);
  // Create indexes
  PlaylistSchema.index({ title: 'text', description: 'text' });
  PlaylistSchema.index({ isPublic: 1 });
  PlaylistSchema.index({ followers: -1 });
  PlaylistSchema.index({ 'tracks.addedAt': -1 });
  return mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
});
