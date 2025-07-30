// controllers/notifications.controller.js
const NotificationsController = (db, wss, notificationService) => {
  // Create a new notification
  const create = async (req, res) => {
    try {
      const notification = await db.notification.create(req.body);
      // Trigger notification sending process
      await notificationService.processNotification(notification);
      return res.status(201).json(notification);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  
  // Create multiple notifications at once
  const createBatch = async (req, res) => {
    
    try {
      const { notifications } = req.body;
      
      if (!notifications || !Array.isArray(notifications)) {
        return res.status(400).json({ message: 'notifications array is required' });
      }

      // Create all notifications
      const createdNotifications = await db.notification.insertMany(notifications);
      
      // Fire and forget with error tracking
      setImmediate(() => {
        Promise.allSettled(createdNotifications.map(notif =>
          notificationService.processNotification(notif)
        )).then(results => {
          const failures = results.filter(r => r.status === 'rejected');
          if (failures.length > 0) {
            console.error('Batch notification processing errors:', 
              failures.map(f => f.reason?.message || f.reason));
          }
          console.log(`Batch processing complete: ${results.length - failures.length}/${results.length} successful`);
        });
      });
      
      return res.status(201).json({ 
        message: 'Batch notifications created',
        count: createdNotifications.length 
      });
    } catch (err) {
      console.error('=== Batch notifications error ===');
      console.error('Error:', err.message);
      console.error('Stack:', err.stack);
      return res.status(500).json({ message: err.message });
    }
  };
  // Get all notifications for a user
  const getUserNotifications = async (req, res) => {
    try {
      const userId = req.params.userId;
      const notifications = await db.notification
        .find({
          userId,
          status: { $in: ['sent', 'read'] },
        })
        .sort({ createdAt: -1 });
      return res.json(notifications);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  // Mark notification as read
  const markAsRead = async (req, res) => {
    try {
      const notification = await db.notification.findByIdAndUpdate(req.params.id, { status: 'read', updatedAt: Date.now() }, { new: true });
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      // Log the read status
      await db.notificationLog.create({
        notificationId: notification._id,
        userId: notification.userId,
        channelType: 'web', // Assuming web as default
        status: 'read',
        readAt: Date.now(),
      });
      return res.json(notification);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  // controllers/notifications.controller.js (добавить к существующему контроллеру)
  // Mark all notifications as read for a user
  const markAllAsRead = async (req, res) => {
    try {
      const userId = req.params.userId;
      // Update all unread notifications for this user
      const result = await db.notification.updateMany({ userId: userId, status: { $in: ['sent', 'unread'] } }, { status: 'read', updatedAt: Date.now() });
      // Get all updated notifications for logging
      const updatedNotifications = await db.notification.find({
        userId: userId,
        status: 'read',
        updatedAt: { $gte: new Date(Date.now() - 10000) }, // Get notifications updated in the last 10 seconds
      });
      // Log the read status for each notification
      const logPromises = updatedNotifications.map(notification => {
        return db.notificationLog.create({
          notificationId: notification._id,
          userId: userId,
          channelType: 'web', // Assuming web as default
          status: 'read',
          readAt: Date.now(),
        });
      });
      await Promise.all(logPromises);
      return res.json({
        message: 'All notifications marked as read',
        count: result.modifiedCount,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  // Register device for push notifications
  const registerDevice = async (req, res) => {
    try {
      const { userId, anonymousId, deviceId, deviceType, deviceToken } = req.body;
      
      // Validate that either userId or anonymousId is provided
      if (!userId && !anonymousId) {
        return res.status(400).json({ message: 'Either userId or anonymousId is required' });
      }
      
      const isAnonymous = !userId;
      let query, updateData;
      
      if (isAnonymous) {
        // For anonymous users
        query = { anonymousId, deviceId };
        updateData = {
          anonymousId,
          deviceId,
          deviceType,
          deviceToken,
          isActive: true,
          isAnonymous: true,
          lastActive: Date.now(),
        };
      } else {
        // For registered users - first delete any anonymous device with same deviceId/token
        await db.userDevice.deleteMany({
          $or: [
            { deviceId, isAnonymous: true },
            { deviceToken, isAnonymous: true }
          ]
        });
        
        query = { userId, deviceId };
        updateData = {
          userId,
          deviceId,
          deviceType,
          deviceToken,
          isActive: true,
          isAnonymous: false,
          lastActive: Date.now(),
        };
      }
      
      // Upsert device registration
      const device = await db.userDevice.findOneAndUpdate(
        query,
        { $set: updateData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      return res.status(201).json(device);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  // Add this to controllers/notifications.controller.js
  const getUserPreferences = async (req, res) => {
    try {
      const userId = req.params.userId;
      const preferences = await db.notificationPreference.find({ userId });
      // Return empty array if no preferences found (this ensures forEach will work)
      return res.json(preferences || []);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  // Update notification preferences
  const updatePreferences = async (req, res) => {
    try {
      const { userId, preferences } = req.body;
      // Bulk upsert preferences
      const operations = preferences.map(pref => ({
        updateOne: {
          filter: {
            userId,
            channelType: pref.channelType,
            notificationType: pref.notificationType,
          },
          update: {
            $set: {
              isEnabled: pref.isEnabled,
            },
          },
          upsert: true,
        },
      }));
      await db.notificationPreference.bulkWrite(operations);
      const updatedPreferences = await db.notificationPreference.find({ userId });
      return res.json(updatedPreferences);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  // Send notification to specific device tokens
  const sendToTokens = async (req, res) => {
    try {
      const { tokens, title, body, data = {} } = req.body;
      
      if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
        return res.status(400).json({ message: 'tokens array is required' });
      }
      
      if (!title || !body) {
        return res.status(400).json({ message: 'title and body are required' });
      }
      
      // Find devices by tokens
      const devices = await db.userDevice.find({
        deviceToken: { $in: tokens },
        isActive: true
      });
      
      const results = [];
      
      // Send to each device
      for (const device of devices) {
        try {
          await notificationService.sendToDeviceToken({
            deviceToken: device.deviceToken,
            deviceType: device.deviceType,
            title,
            body,
            data
          });
          results.push({ token: device.deviceToken, success: true });
        } catch (error) {
          results.push({ token: device.deviceToken, success: false, error: error.message });
        }
      }
      
      return res.json({
        message: 'Notifications sent',
        results,
        total: tokens.length,
        found: devices.length
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  
  // Send notification to anonymous devices
  const sendToAnonymous = async (req, res) => {
    try {
      const { anonymousIds, title, body, data = {} } = req.body;
      
      if (!title || !body) {
        return res.status(400).json({ message: 'title and body are required' });
      }
      
      let devices;
      
      if (anonymousIds && Array.isArray(anonymousIds)) {
        // Send to specific anonymous IDs
        devices = await db.userDevice.find({
          anonymousId: { $in: anonymousIds },
          isAnonymous: true,
          isActive: true
        });
      } else {
        // Send to all anonymous devices
        devices = await db.userDevice.find({
          isAnonymous: true,
          isActive: true
        });
      }
      
      const results = [];
      
      // Send to each device
      for (const device of devices) {
        try {
          await notificationService.sendToDeviceToken({
            deviceToken: device.deviceToken,
            deviceType: device.deviceType,
            title,
            body,
            data
          });
          results.push({ anonymousId: device.anonymousId, deviceToken: device.deviceToken, success: true });
        } catch (error) {
          results.push({ anonymousId: device.anonymousId, deviceToken: device.deviceToken, success: false, error: error.message });
        }
      }
      
      return res.json({
        message: 'Notifications sent to anonymous devices',
        results,
        devicesFound: devices.length
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  return {
    create,
    createBatch,
    getUserNotifications,
    markAsRead,
    registerDevice,
    updatePreferences,
    getUserPreferences,
    markAllAsRead,
    sendToTokens,
    sendToAnonymous,
  };
};
export default NotificationsController;
