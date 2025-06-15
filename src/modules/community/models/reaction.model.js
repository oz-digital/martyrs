export default db => {
  const ReactionSchema = new db.mongoose.Schema(
    {
      user: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: function (value) {
          if (this.owner.type === 'user') return 'User';
          if (this.owner.type === 'organization') return 'Organization';
        },
        required: true,
      },
      type: {
        type: String,
        enum: ['event', 'comment', 'blogpost', 'mix'],
        default: 'blogpost',
        required: true,
      },
      target: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: function (value) {
          if (this.owner.type === 'event') return 'Event';
          if (this.owner.type === 'comment') return 'Comment';
          if (this.owner.blogpost === 'blogpost') return 'Blogpost';
        },
      },
      targetString: {
        type: String,
      },
      class: {
        type: String,
        enum: ['like', 'dislike', 'emoji'],
        default: 'like',
        required: true,
      },
      content: {
        type: String,
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    },
    {
      strict: false,
    }
  );
  const Reaction = db.mongoose.model('Reaction', ReactionSchema);
  return Reaction;
};
