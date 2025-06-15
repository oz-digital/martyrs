export default (db, additionalFields = {}) => {
  const schema = new db.mongoose.Schema({
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deviceId: { type: String, required: true },
    deviceType: { type: String, enum: ['ios', 'android', 'web'], required: true },
    deviceToken: { type: String, required: true }, // Push token for mobile, or web token
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
  });
  schema.index({ userId: 1, deviceId: 1 }, { unique: true });
  return db.mongoose.model('UserDevice', schema);
};
