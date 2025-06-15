import webpush from 'web-push';
// Configure web push with VAPID keys
webpush.setVapidDetails(`mailto:${process.env.VAPID_EMAIL}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
const WebPushService = {
  send: async ({ token, title, body, data = {} }) => {
    try {
      // Parse the subscription object from the token
      const subscription = JSON.parse(token);
      console.log('title is', title);
      console.log('body is', body);
      console.log('data is', data);
      // Prepare the notification payload
      const payload = JSON.stringify({
        title: title,
        body: body,
        icon: process.env.NOTIFICATION_ICON_URL || '/favicon.ico',
        badge: process.env.NOTIFICATION_BADGE_URL || '/favicon.ico',
        data: data,
      });
      console.log('payload is', payload);
      // Send the notification
      const result = await webpush.sendNotification(subscription, payload);
      console.log('web push is', result);
      return { success: true, statusCode: result.statusCode };
    } catch (error) {
      console.error('Web Push service error:', error);
      throw error;
    }
  },
};
export default WebPushService;
