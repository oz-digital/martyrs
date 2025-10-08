export default db => {
  const InitiativeSchema = new db.mongoose.Schema(
    {
      title: { type: String },
      name: { type: String },
      description: { type: String },
      status: { type: String },
      client: { type: String },
      date: { type: db.mongoose.Schema.Types.Mixed },
      url: { type: String },
      cover: { type: db.mongoose.Schema.Types.Mixed },
      published: { type: db.mongoose.Schema.Types.Mixed },
      structure: { type: db.mongoose.Schema.Types.Mixed },
      team: { type: db.mongoose.Schema.Types.Mixed },
      services: { type: db.mongoose.Schema.Types.Mixed },
      createdBy: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
      strict: false,
      collection: 'initiatives'
    }
  );
  const Initiative = db.mongoose.model('Initiative', InitiativeSchema);
  return Initiative;
};
