export default (db, additionalFields = {}) => {
  const schema = new db.mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true }, // Type of notification (e.g., 'alert', 'info', 'promo')
    metadata: { type: Object, default: {} }, // Additional data specific to notification type
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed', 'read'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  return db.mongoose.model('Notification', schema);
};
