export default db => {
  const ApplicationSchema = new db.mongoose.Schema(
    {
      status: {
        type: String,
        default: 'created',
      },
      type: {
        type: String,
        default: 'newsletter',
      },
      contacts: {
        name: {
          type: String,
        },
        phone: {
          type: String,
        },
        email: {
          type: String,
        },
      },
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );
  const Application = db.mongoose.model('Application', ApplicationSchema);
  return Application;
};
