export default db => {
  const TaskSchema = new db.mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'],
        default: 'not_started',
      },
      assignedTo: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      dueDate: {
        type: Date,
      },
      // Reference to milestone
      milestone: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Milestone',
      },
      initiative: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Initiative',
      },
      // Added priority
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
      },
      // Added tags
      tags: [
        {
          type: String,
        },
      ],
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );
  // Add indexes
  TaskSchema.index({ milestone: 1 });
  TaskSchema.index({ assignedTo: 1 });
  TaskSchema.index({ status: 1 });
  TaskSchema.index({ dueDate: 1 });
  const Task = db.mongoose.model('Task', TaskSchema);
  return Task;
};
