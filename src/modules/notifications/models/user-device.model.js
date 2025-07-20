export default (db, additionalFields = {}) => {
  const schema = new db.mongoose.Schema({
    userId: { type: db.mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    anonymousId: { type: String, required: false }, // For anonymous users
    deviceId: { type: String, required: true },
    deviceType: { type: String, enum: ['ios', 'android', 'web'], required: true },
    deviceToken: { type: String, required: true }, // Push token for mobile, or web token
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
    isAnonymous: { type: Boolean, default: false }, // Flag to identify anonymous devices
  });
  
  // Compound indexes for both registered and anonymous users
  schema.index({ userId: 1, deviceId: 1 }, { unique: true, sparse: true });
  schema.index({ anonymousId: 1, deviceId: 1 }, { unique: true, sparse: true });
  schema.index({ deviceToken: 1 }, { unique: true });
  schema.index({ isAnonymous: 1, isActive: 1 });
  
  return db.mongoose.model('UserDevice', schema);
};
