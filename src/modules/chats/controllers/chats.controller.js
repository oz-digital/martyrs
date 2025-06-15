import mailing from '@martyrs/src/modules/globals/controllers/utils/mailing.js';
const { sendChatMessageTelegram } = mailing;
const controllerFactory = db => {
  const ChatMessage = db.chat;
  const saveMessage = async msg => {
    try {
      const message = new ChatMessage(msg);
      await message.save();
      return message;
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };
  const getMessages = async chatId => {
    try {
      const messages = await ChatMessage.find({ chatId }).sort({ createdAt: 1 });
      return messages;
    } catch (error) {
      console.error('Error retrieving messages from database:', error);
    }
  };
  return {
    saveMessage,
    getMessages,
  };
};
export default controllerFactory;
