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
        userId: new ObjectId(userId),
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
        userId: new ObjectId(userId),
        isActive: true,
      });
      console.log('=== CHANNEL SELECTION DEBUG ===');
      console.log('userDevices found:', userDevices.length);
      console.log('userDevices:', userDevices);
      console.log('user.email:', user.email);
      console.log('user.phoneNumber:', user.phoneNumber);
      console.log('preferences.length:', preferences.length);
      
      // Default channels if no preferences set
      let channels = ['web']; // Web is always on by default
      
      // If user has devices, add push to default channels
      if (userDevices.length > 0) {
        channels.push('push');
        console.log('Added push channel - devices found');
      } else {
        console.log('No push channel - no devices found');
      }
      
      // If user has email, add it to default channels
      if (user.email) {
        channels.push('email');
        console.log('Added email channel');
      }
      // If user has phone, add SMS to default channels
      if (user.phoneNumber) {
        channels.push('sms');
        console.log('Added SMS channel');
      }
      // Override with user preferences if they exist
      if (preferences.length > 0) {
        channels = preferences.filter(pref => pref.isEnabled).map(pref => pref.channelType);
        console.log('Overridden with user preferences:', channels);
      }
      console.log('=== FINAL CHANNELS ===', channels);
      // Send to each enabled channel - parallel processing
      const channelPromises = [];

      for (const channel of channels) {
        console.log(`=== PREPARING CHANNEL: ${channel} ===`);
        const sendFunc = channelRouters[channel];
        if (!sendFunc) {
          channelPromises.push(Promise.resolve({
            channel,
            success: false,
            error: 'No send function'
          }));
          continue;
        }

        if (channel === 'push') {
          console.log(`Preparing push to ${userDevices.length} devices`);
          // Each device as separate promise for true parallelism
          for (const device of userDevices) {
            channelPromises.push(
              sendFunc(notification, user, device)
                .then(() => {
                  console.log(`Push sent successfully to device ${device.deviceId}`);
                  return { channel: 'push', deviceId: device.deviceId, success: true };
                })
                .catch(err => {
                  console.error(`Push failed for device ${device.deviceId}:`, err);
                  return { channel: 'push', deviceId: device.deviceId, success: false, error: err.message };
                })
            );
          }
        } else {
          channelPromises.push(
            sendFunc(notification, user)
              .then(() => {
                console.log(`${channel} notification sent successfully`);
                return { channel, success: true };
              })
              .catch(err => {
                console.error(`${channel} notification failed:`, err);
                return { channel, success: false, error: err.message };
              })
          );
        }
      }

      console.log(`=== PROCESSING ${channelPromises.length} PARALLEL OPERATIONS ===`);
      const results = await Promise.allSettled(channelPromises);
      
      // Process results and create batch logs
      const logs = [];
      const channelSuccessMap = new Map();

      results.forEach(({ status, value }) => {
        if (status === 'fulfilled' && value) {
          const logEntry = {
            notificationId: notification._id,
            userId: notification.userId,
            channelType: value.channel,
            status: value.success ? 'sent' : 'failed',
            sentAt: Date.now()
          };
          
          if (!value.success) {
            logEntry.error = value.error;
          }
          
          logs.push(logEntry);
          
          // Mark channel success
          if (value.success) {
            channelSuccessMap.set(value.channel, true);
          }
        }
      });

      // Fire and forget batch log insertion
      if (logs.length > 0) {
        setImmediate(() => db.notificationLog.insertMany(logs).catch(console.error));
        console.log(`Scheduled ${logs.length} logs for batch insertion`);
      }

      const hasSuccessfulSend = channelSuccessMap.size > 0;
      console.log(`=== PROCESSING COMPLETE - Success: ${hasSuccessfulSend} ===`);
      
      // Fire and forget status update
      setImmediate(() => {
        db.notification.findByIdAndUpdate(notification._id, {
          status: hasSuccessfulSend ? 'sent' : 'failed',
          updatedAt: Date.now(),
        }).catch(console.error);
      });
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
