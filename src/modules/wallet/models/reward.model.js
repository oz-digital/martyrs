export default db => {
  const RewardSchema = new db.mongoose.Schema(
    {
      user: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: () => {
          if (this.owner.type === 'user') return 'User';
          if (this.owner.type === 'organization') return 'Organization';
        },
        required: true,
      },
      type: {
        type: String,
        enum: ['blogpost', 'order'],
        required: true,
      },
      target: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: () => {
          if (this.owner.blogpost === 'blogpost') return 'Blogpost';
          if (this.owner.blogpost === 'order') return 'Order';
        },
        required: true,
      },
      amount: {
        type: String,
        required: true,
      },
      snapshot: {
        views: {
          type: String,
          required: true,
        },
        reactions: {
          type: String,
          required: true,
        },
        comments: {
          type: String,
          required: true,
        },
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    },
    { strict: false }
  );
  return db.mongoose.model('Reward', RewardSchema);
};
