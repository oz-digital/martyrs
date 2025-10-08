export default db => {
  const VotingSchema = new db.mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String },
      type: {
        type: String,
        enum: ['create_task', 'approve_task', 'create_initiative', 'update_milestone', 'general'],
        default: 'general',
        required: true,
      },
      targetModel: {
        type: String,
        enum: ['Task', 'Initiative', 'Milestone', null],
      },
      targetId: {
        type: db.mongoose.Schema.Types.ObjectId,
      },
      threshold: {
        type: Number,
        default: 51, // Percentage needed for approval
        min: 1,
        max: 100,
      },
      participants: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      result: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      initiative: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Initiative',
      },
      milestone: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Milestone',
      },
      metadata: {
        type: Object, // For storing additional data like taskData for create_task voting
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['pending', 'active', 'closed'],
        default: 'pending',
      },
      votes: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Vote',
        },
      ],
    },
    {
      timestamps: { currentTime: () => Date.now() },
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  // Virtuals
  VotingSchema.virtual('voteCount').get(function () {
    return this.votes ? this.votes.length : 0;
  });

  VotingSchema.virtual('isActive').get(function () {
    const now = new Date();
    return this.status === 'active' ||
           (this.status === 'pending' && (!this.endDate || this.endDate > now));
  });

  // Indexes
  VotingSchema.index({ initiative: 1 });
  VotingSchema.index({ milestone: 1 });
  VotingSchema.index({ type: 1, targetId: 1 });
  VotingSchema.index({ result: 1 });

  const Voting = db.mongoose.model('Voting', VotingSchema);
  return Voting;
};
