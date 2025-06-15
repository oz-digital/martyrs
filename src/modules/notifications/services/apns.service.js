import apn from 'apn';
let apnProvider = null;
const getApnProvider = () => {
  if (!apnProvider) {
    apnProvider = new apn.Provider({
      token: {
        key: process.env.APN_KEY_PATH,
        keyId: process.env.APN_KEY_ID,
        teamId: process.env.APN_TEAM_ID,
      },
      production: process.env.NODE_ENV === 'production',
    });
  }
  return apnProvider;
};
const ApnsService = {
  send: async ({ token, title, body, data = {} }) => {
    try {
      const provider = getApnProvider();
      const notification = new apn.Notification();
      notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour
      notification.badge = 1;
      notification.sound = 'ping.aiff';
      notification.alert = {
        title: title,
        body: body,
      };
      notification.topic = process.env.APN_BUNDLE_ID;
      notification.payload = data;
      const result = await provider.send(notification, token);
      // Check for sent/failed
      if (result.failed.length > 0) {
        const error = result.failed[0].response;
        throw new Error(`APNS send failed: ${error.reason}`);
      }
      return { success: true, messageId: result.sent[0].headers['apns-id'] };
    } catch (error) {
      console.error('APNS service error:', error);
      throw error;
    }
  },
};
export default ApnsService;
