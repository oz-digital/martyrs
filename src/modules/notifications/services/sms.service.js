import mailing from '@martyrs/src/modules/core/controllers/utils/mailing.js';
// services/sms.service.js
const { sendSms } = mailing;
const SmsService = {
  send: async ({ to, message }) => {
    try {
      // Send SMS using the utility function
      const result = await sendSms(to, message);
      if (!result) {
        throw new Error('Failed to send SMS');
      }
      return { success: true, messageId: Date.now().toString() };
    } catch (error) {
      console.error('SMS service error:', error);
      throw error;
    }
  },
};
export default SmsService;
