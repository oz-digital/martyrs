import applyCommonSchema from '@martyrs/src/modules/core/models/schemas/common.schema.js';
import applyEngagementSchema from '@martyrs/src/modules/core/models/schemas/engagement.schema.js';
import applyMetadataSchema from '@martyrs/src/modules/core/models/schemas/metadata.schema.js';
import applyOwnershipSchema from '@martyrs/src/modules/core/models/schemas/ownership.schema.js';
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
    ticketsTypes: [{
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      photo: {
        type: String,
      },
      price: {
        type: Number,
      },
      validity: {
        always: {
          type: Boolean,
          default: true,
        },
        start: {
          type: Date,
        },
        end: {
          type: Date,
        },
      },
    }]
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
