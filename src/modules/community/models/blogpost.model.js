import applyCommonSchema from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/globals/models/schemas/engagement.schema.js';
import applyMetadataSchema from '@martyrs/src/modules/globals/models/schemas/metadata.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';
export default db => {
  const BlogpostSchema = new db.mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      content: {
        type: Array,
      },
      source: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      strict: true,
    }
  );
  applyCommonSchema(BlogpostSchema, db);
  applyEngagementSchema(BlogpostSchema, db);
  applyOwnershipSchema(BlogpostSchema, db);
  applyMetadataSchema(BlogpostSchema, db);
  const Blogpost = db.mongoose.model('Blogpost', BlogpostSchema);
  return Blogpost;
};
