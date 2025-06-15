export default db => {
  const VisitorSchema = new db.mongoose.Schema({
    ip: String,
    userAgent: String,
    acceptLanguage: String,
    fingerprint: { type: String, unique: true },
  });
  // VisitorSchema.index({ fingerprint: 1 });
  const Visitor = db.mongoose.model('Visitor', VisitorSchema);
  return Visitor;
};
