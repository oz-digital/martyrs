import applyCommonSchema from '@martyrs/src/modules/globals/models/schemas/common.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/globals/models/schemas/engagement.schema.js';
import applyMetadataSchema from '@martyrs/src/modules/globals/models/schemas/metadata.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';
export default (db, additionalFields = {}) => {
  const baseSchema = {
    cover: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    content: {
      type: Array,
    },
    date: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
      },
    },
    ticketsTypes: {
      type: Array,
    },
    // ticketsTypes: [{
    //     image: String,
    //     link: String,
    //     price: Number,
    //     name: String,
    //     buttonText: String
    //     stripeProductId
    //     stripePriceId
    //     stripePaymentLinkId
    // }]
  };
  const EventSchema = new db.mongoose.Schema(
    {
      ...baseSchema,
      ...additionalFields,
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    }
  );
  EventSchema.index({
    name: 1,
    'date.start': 1,
    'date.end': -1,
  });
  applyCommonSchema(EventSchema, db);
  applyEngagementSchema(EventSchema, db);
  applyOwnershipSchema(EventSchema, db);
  applyMetadataSchema(EventSchema, db);
  return db.mongoose.model('Event', EventSchema);
};
