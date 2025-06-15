export default db => {
  const ChatMessageSchema = new db.mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  const ChatMessage = db.mongoose.model('ChatMessage', ChatMessageSchema);
  return ChatMessage;
};
