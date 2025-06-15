import { Types } from 'mongoose';
import apns from './apns.service.js';
import emailService from './email.service.js';
import fcm from './fcm.service.js';
import smsService from './sms.service.js';
import telegramService from './telegram.service.js';
import webPush from './web-push.service.js';
import whatsappService from './whatsapp.service.js';
const ObjectId = { Types }.Types.ObjectId;
export default (function (db, wss) {
  wss.registerModule('notification', async (ws, msg) => {
    console.log('[WebSocket][notification] msg:', msg);
  });
  // Process and route notification to appropriate channels
  const processNotification = async notification => {
    try {
      const userId = notification.userId.toString();
      // Get user preferences
      const preferences = await db.notificationPreference.find({
        userId: userId,
        // notificationType: notification.type
      });
      console.log('userId', userId);
      console.log('preferences', preferences);
      console.log('notificationType', notification.type);
      console.log('notification', notification);
      // Get user data
      const user = await db.mongoose.model('User').findById(new ObjectId(userId));
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      // Create a channel router map
      const channelRouters = {
        web: sendWebNotification,
        push: sendPushNotification,
        email: sendEmailNotification,
        sms: sendSmsNotification,
        // telegram: sendTelegramNotification,
        // whatsapp: sendWhatsAppNotification
      };
      // Get all active devices for push notifications
      const userDevices = await db.userDevice.find({
        userId,
        isActive: true,
      });
      // Default channels if no preferences set
      let channels = ['web']; // Web is always on by default
      // If user has email, add it to default channels
      if (user.email) {
        channels.push('email');
      }
      // If user has phone, add SMS to default channels
      if (user.phoneNumber) {
        channels.push('sms');
      }
      // Override with user preferences if they exist
      if (preferences.length > 0) {
        channels = preferences.filter(pref => pref.isEnabled).map(pref => pref.channelType);
      }
      console.log('channels', channels);
      // Send to each enabled channel
      for (const channel of channels) {
        const sendFunc = channelRouters[channel];
        if (sendFunc) {
          try {
            // For push notifications, we need to send to all devices
            if (channel === 'push') {
              for (const device of userDevices) {
                await sendFunc(notification, user, device);
              }
            } else {
              await sendFunc(notification, user);
            }
            // Update notification status
            await db.notification.findByIdAndUpdate(notification._id, {
              status: 'sent',
              updatedAt: Date.now(),
            });
            // Log the sent notification
            await db.notificationLog.create({
              notificationId: notification._id,
              userId: notification.userId,
              channelType: channel,
              status: 'sent',
              sentAt: Date.now(),
            });
          } catch (error) {
            console.error(`Error sending ${channel} notification:`, error);
            // Log the failed notification
            await db.notificationLog.create({
              notificationId: notification._id,
              userId: notification.userId,
              channelType: channel,
              status: 'failed',
              error: error.message,
              sentAt: Date.now(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing notification:', error);
      // Update notification status to failed
      await db.notification.findByIdAndUpdate(notification._id, {
        status: 'failed',
        updatedAt: Date.now(),
      });
    }
  };
  // Send websocket notifications
  const sendWebNotification = async (notification, user) => {
    console.log(`[WebSocket][notification] sending to user ${user._id}`);
    const result = await wss.sendToUserInModule('notification', user._id, {
      type: 'notification',
      data: notification,
    });
    if (!result) {
      console.log(`Failed to send web notification to user ${user._id}`);
    }
  };
  // Send push notification to mobile device
  const sendPushNotification = async (notification, user, device) => {
    const pushService = getPushServiceByDeviceType(device.deviceType);
    return pushService.send({
      token: device.deviceToken,
      title: notification.title,
      body: notification.body,
      data: notification.metadata,
    });
  };
  // Get the appropriate push service based on device type
  const getPushServiceByDeviceType = deviceType => {
    if (deviceType === 'ios') {
      return apns;
    } else if (deviceType === 'android') {
      return fcm;
    } else {
      return webPush;
    }
  };
  // Send email notification
  const sendEmailNotification = async (notification, user) => {
    return emailService.send({
      to: user.email,
      subject: notification.title,
      text: notification.body,
      html: `<h1>${notification.title}</h1><p>${notification.body}</p>`,
      metadata: notification.metadata,
    });
  };
  // Send SMS notification
  const sendSmsNotification = async (notification, user) => {
    return smsService.send({
      to: user.phoneNumber,
      message: `${notification.title}: ${notification.body}`,
    });
  };
  // Send Telegram notification (for future expansion)
  const sendTelegramNotification = async (notification, user) => {
    return telegramService.send({
      chatId: user.telegramChatId,
      message: `${notification.title}\n\n${notification.body}`,
    });
  };
  // Send WhatsApp notification (for future expansion)
  const sendWhatsAppNotification = async (notification, user) => {
    return whatsappService.send({
      to: user.phoneNumber,
      message: `${notification.title}\n\n${notification.body}`,
    });
  };
  // Batch process pending notifications
  const processPendingNotifications = async () => {
    const pendingNotifications = await db.notification
      .find({
        status: 'pending',
      })
      .limit(100);
    for (const notification of pendingNotifications) {
      await processNotification(notification);
    }
  };
  return {
    processNotification,
    processPendingNotifications,
  };
});
