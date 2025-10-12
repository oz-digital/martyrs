import mailing from '@martyrs/src/modules/core/controllers/utils/mailing.js';
// services/telegram.service.js
const { sendChatMessageTelegram } = mailing;
const TelegramService = {
  send: async ({ chatId, message }) => {
    try {
      // Send Telegram message using the utility function
      // Note: our utility expects an array of chatIds
      const result = await sendChatMessageTelegram([chatId], message);
      if (!result) {
        throw new Error('Failed to send Telegram message');
      }
      return { success: true, messageId: Date.now().toString() };
    } catch (error) {
      console.error('Telegram service error:', error);
      throw error;
    }
  },
};
export default TelegramService;

