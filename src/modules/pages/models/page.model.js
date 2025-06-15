export default db => {
  const PageSchema = new db.mongoose.Schema(
    {
      name: { type: Object },
      url: { type: String },
      groups: { type: Array },
      content: { type: [Object, Array] },
      parent: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Page',
      },
      children: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Page',
        },
      ],
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );
  const Page = db.mongoose.model('Page', PageSchema);
  return Page;
};
