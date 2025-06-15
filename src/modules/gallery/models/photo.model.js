import applyCommonSchema from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/globals/models/schemas/engagement.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';
export default db => {
  const PhotoSchema = new db.mongoose.Schema(
    {
      cover: {
        type: String,
        required: true,
      },
      tags: {
        type: Array,
      },
      image: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    }
  );
  applyCommonSchema(PhotoSchema, db);
  applyEngagementSchema(PhotoSchema, db);
  applyOwnershipSchema(PhotoSchema, db);
  const Photo = db.mongoose.model('Photo', PhotoSchema);
  Photo.collection.dropIndexes(function (err, results) {
    // Handle errors
  });
  return Photo;
};
