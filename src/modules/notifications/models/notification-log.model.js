export default (db, additionalFields = {}) => {
  const schema = new db.mongoose.Schema({
    notificationId: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
    },
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channelType: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'failed', 'read'], required: true },
    error: { type: String },
    sentAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  });
  return db.mongoose.model('NotificationLog', schema);
};
