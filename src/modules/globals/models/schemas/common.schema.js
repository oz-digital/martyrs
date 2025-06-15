export default (function applyCommonSchema(schema, db) {
  schema.add({
    status: {
      type: String,
      enum: ['draft', 'published', 'featured', 'archived', 'removed'],
      default: 'draft',
      required: true,
    },
  });
});
