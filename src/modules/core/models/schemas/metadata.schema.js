import createFriendlyURL from '@martyrs/src/modules/core/controllers/utils/seo-friendly-url.js';
export default (function applyMetadataSchema(schema, db) {
  schema.add({
    url: {
      type: String,
      unique: true,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
  });
  schema.pre('save', function (next) {
    // Генерируем URL только если он не задан.
    if (!this.url) {
      const name = this.name || this.title || (this.profile ? this.profile.name : '');
      if (name) {
        this.url = createFriendlyURL(name);
      }
    }
    next();
  });
  schema.index({
    url: 1,
    tags: 1,
  });
});
