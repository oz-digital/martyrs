export default db => {
  const InitiativeSchema = new db.mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'cancelled'],
        default: 'draft',
      },
      createdBy: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      tasks: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Task',
        },
      ],
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );
  const Initiative = db.mongoose.model('Initiative', InitiativeSchema);
  return Initiative;
};
