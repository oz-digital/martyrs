import applyOwnershipSchema from '@martyrs/src/modules/globals/models/schemas/ownership.schema.js';
export default db => {
  const CommentSchema = new db.mongoose.Schema({
    type: {
      type: String,
      enum: ['blogpost', 'comment', 'photo', 'event'],
      default: 'post',
      required: true,
    },
    target: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: function (value) {
        if (this.type === 'blogpost') return 'Blogpost';
        if (this.type === 'comment') return 'Comment';
        if (this.type === 'event') return 'Event';
        if (this.type === 'photo') return 'Photo';
      },
      required: true,
    },
    parent: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    children: [
      {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    depth: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  applyOwnershipSchema(CommentSchema, db);
  CommentSchema.index({ target: 1, parent: 1, depth: 1 });
  const Comment = db.mongoose.model('Comment', CommentSchema);
  return Comment;
};
