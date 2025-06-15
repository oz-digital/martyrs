export default (function (db) {
  const mongoose = db.mongoose;
  const Schema = mongoose.Schema;
  const PlayHistorySchema = new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      track: {
        type: Schema.Types.ObjectId,
        ref: 'Track',
        required: true,
      },
      playedAt: {
        type: Date,
        default: Date.now,
      },
      playDuration: {
        type: Number,
        default: 0,
      },
      playedFrom: {
        type: String,
        enum: ['playlist', 'album', 'search', 'recommendation', 'artist', 'other'],
        default: 'other',
      },
      contextId: {
        type: Schema.Types.ObjectId,
        refPath: 'playedFrom',
      },
      deviceInfo: {
        type: String,
      },
      location: {
        type: String,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );
  // Create indexes
  PlayHistorySchema.index({ user: 1, playedAt: -1 });
  PlayHistorySchema.index({ track: 1 });
  PlayHistorySchema.index({ playedAt: -1 });
  return mongoose.models.PlayHistory || mongoose.model('PlayHistory', PlayHistorySchema);
});
