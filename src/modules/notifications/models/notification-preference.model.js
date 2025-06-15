export default (db, additionalFields = {}) => {
  const schema = new db.mongoose.Schema({
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channelType: {
      type: String,
      enum: ['web', 'push', 'email', 'sms', 'telegram', 'whatsapp'],
      required: true,
    },
    notificationType: { type: String, required: true }, // Type of notification (alerts, promotions, etc.)
    isEnabled: { type: Boolean, default: true },
  });
  schema.index({ userId: 1, channelType: 1, notificationType: 1 }, { unique: true });
  return db.mongoose.model('NotificationPreference', schema);
};
