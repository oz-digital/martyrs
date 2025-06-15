export default (function applyCredentialsSchema(schema, db) {
  schema.add({
    phone: String,
    email: String,
    apple_id: String,
  });
});
