export default db => {
  const ChatMessageSchema = new db.mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Make optional for anonymous users
    },
    anonymousId: {
      type: String,
      required: false // For anonymous users
    },
    chatId: {
      type: String,
      required: true,
    },
    chatType: {
      type: String,
      required: true,
      enum: ['order', 'group', 'support', 'private'],
      default: 'private'
    },
    text: {
      type: String,
      required: true,
    },
    readBy: [{
      userId: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  const ChatMessage = db.mongoose.model('ChatMessage', ChatMessageSchema);
  return ChatMessage;
};
