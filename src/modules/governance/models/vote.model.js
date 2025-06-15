export default db => {
  const VoteSchema = new db.mongoose.Schema(
    {
      value: { type: Number, required: true },
      voter: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      voting: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Voting',
        required: true,
      },
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );
  const Vote = db.mongoose.model('Vote', VoteSchema);
  return Vote;
};
