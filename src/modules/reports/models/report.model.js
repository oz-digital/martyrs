export default db => {
  const ReportSchema = new db.mongoose.Schema(
    {
      status: {
        type: String,
        enum: ['new', 'in progress', 'canceled', 'closed'],
        default: 'new',
      },
      user: {
        type: String,
        default: 'anonymous',
        required: true,
      },
      type: {
        type: String,
        enum: ['user', 'organization', 'blogpost', 'event', 'comment'],
        default: 'spam',
        required: true,
      },
      reason: {
        type: String,
        enum: ['spam', 'harassment', 'inappropriate', 'misinformation', 'copyright', 'other'],
        default: 'spam',
        required: true,
      },
      target: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: function (value) {
          if (this.type === 'user') return 'User';
          if (this.type === 'organization') return 'Organization';
        },
        required: true,
      },
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );
  const Report = db.mongoose.model('Report', ReportSchema);
  return Report;
};
