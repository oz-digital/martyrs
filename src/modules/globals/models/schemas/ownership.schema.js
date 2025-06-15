export default (function applyOwnershipSchema(schema, db) {
  
  schema.add({
    owner: {
      type: {
        type: String,
        required: true,
        enum: ['user', 'organization', 'platform'],
      },
      target: {
        type: db.mongoose.Schema.Types.ObjectId,
        refPath: 'owner.type',
        required: function () {
          return this.owner.type !== 'platform';
        },
      },
    },
    creator: {
      hidden: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        required: true,
        enum: ['user', 'organization', 'customer', 'platform'],
      },
      target: {
        type: db.mongoose.Schema.Types.ObjectId,
        refPath: 'creator.type',
        required: function () {
          return this.creator.type !== 'platform';
        },
      },
    },
  });

  schema.index({
    'owner.target': 1,
    'creator.target': 1,
  });

});
