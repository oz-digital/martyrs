export default (function applySocialsSchema(schema, db) {
  schema.add({
    socials: {
      telegram: {
        type: String,
        default: '',
      },
      twitter: {
        type: String,
        default: '',
      },
      facebook: {
        type: String,
        default: '',
      },
      instagram: {
        type: String,
        default: '',
      },
    },
  });
});
