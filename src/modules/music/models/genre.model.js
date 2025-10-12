import applyCommonSchema from '@martyrs/src/modules/core/models/schemas/common.schema.js';
import applyMetadataSchema from '@martyrs/src/modules/core/models/schemas/metadata.schema.js';
export default (function (db) {
  const mongoose = db.mongoose;
  const Schema = mongoose.Schema;
  const GenreSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      description: {
        type: String,
        trim: true,
      },
      iconUrl: {
        type: String,
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
  applyCommonSchema(GenreSchema, db);
  applyMetadataSchema(GenreSchema, db);
  // Create indexes
  GenreSchema.index({ name: 'text', description: 'text' });
  GenreSchema.index({ popularity: -1 });
  return mongoose.models.Genre || mongoose.model('Genre', GenreSchema);
});
