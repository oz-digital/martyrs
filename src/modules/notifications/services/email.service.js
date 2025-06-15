import mailing from '@martyrs/src/modules/globals/controllers/utils/mailing.js';
// services/email.service.js
const { sendEmail } = mailing;
const EmailService = {
  send: async ({ to, subject, text, html, metadata = {} }) => {
    try {
      // Convert any attachments from metadata if present
      const files = metadata.attachments || [];
      // Send email using the utility function
      const result = await sendEmail(to, subject, text, files);
      if (!result) {
        throw new Error('Failed to send email');
      }
      return { success: true, messageId: Date.now().toString() };
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  },
};
export default EmailService;
