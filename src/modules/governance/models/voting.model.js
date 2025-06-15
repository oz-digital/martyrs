export default db => {
  const VotingSchema = new db.mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
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
    }
  );
  const Voting = db.mongoose.model('Voting', VotingSchema);
  return Voting;
};
