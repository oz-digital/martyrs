export default db => {
  const MilestoneSchema = new db.mongoose.Schema(
    {
      name: {
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
      startDate: {
        type: Date,
        required: true,
      },
      dueDate: {
        type: Date,
        required: true,
      },
      completedDate: {
        type: Date,
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      owner: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      contributors: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      initiative: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Initiative',
        required: true,
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
      },
      tags: [
        {
          type: String,
        },
      ],
      dependencies: [
        {
          milestone: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: 'Milestone',
          },
          type: {
            type: String,
            enum: ['blocks', 'blocked_by', 'related_to'],
            required: true,
          },
        },
      ],
      metadata: {
        estimatedHours: Number,
        actualHours: Number,
        budget: Number,
        actualCost: Number,
        notes: String,
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );
  // Virtuals
  MilestoneSchema.virtual('isOverdue').get(function () {
    return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
  });
  MilestoneSchema.virtual('duration').get(function () {
    return this.dueDate ? Math.ceil((this.dueDate - this.startDate) / (1000 * 60 * 60 * 24)) : null;
  });
  // Indexes
  MilestoneSchema.index({ initiative: 1, status: 1 });
  MilestoneSchema.index({ owner: 1 });
  MilestoneSchema.index({ dueDate: 1 });
  MilestoneSchema.index({ 'dependencies.milestone': 1 });
  const Milestone = db.mongoose.model('Milestone', MilestoneSchema);
  return Milestone;
};
