export default (function applyProfileSchema(schema, db) {
  schema.add({
    profile: {
      photo: {
        type: String,
        default: null,
      },
      name: {
        type: String,
        default: null,
      },
      description: {
        type: String,
        default: null,
      },
    },
  });
});
