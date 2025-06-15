import admin from 'firebase-admin';
import path from 'path';
// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      // Load the service account key JSON file
      path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    ),
    // Optional: databaseURL, storageBucket, etc.
  });
}
const FcmService = {
  send: async ({ token, title, body, data = {} }) => {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: Object.keys(data).reduce((acc, key) => {
          // FCM data payload must be strings
          acc[key] = String(data[key]);
          return acc;
        }, {}),
        token,
      };
      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('FCM service error:', error);
      throw error;
    }
  },
  sendMulticast: async ({ tokens, title, body, data = {} }) => {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: Object.keys(data).reduce((acc, key) => {
          // FCM data payload must be strings
          acc[key] = String(data[key]);
          return acc;
        }, {}),
        tokens,
      };
      const response = await admin.messaging().sendMulticast(message);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      console.error('FCM multicast service error:', error);
      throw error;
    }
  },
};
export default FcmService;
