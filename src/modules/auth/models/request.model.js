export default db => {
  const RequestSchema = new db.mongoose.Schema({
    visitor: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
    },
    path: String,
    method: String,
    timestamp: { type: Date, default: Date.now },
  });
  RequestSchema.index({ visitor: 1 });
  const Request = db.mongoose.model('Request', RequestSchema);
  return Request;
};
