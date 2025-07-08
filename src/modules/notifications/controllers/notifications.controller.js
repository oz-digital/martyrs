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
    console.log('=== Batch notifications endpoint ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
      const { notifications } = req.body;
      
      if (!notifications || !Array.isArray(notifications)) {
        console.error('Invalid request: notifications array is required');
        return res.status(400).json({ message: 'notifications array is required' });
      }

      console.log('Creating notifications count:', notifications.length);

      // Create all notifications
      const createdNotifications = await db.notification.insertMany(notifications);
      console.log('Created notifications:', createdNotifications.map(n => n._id));
      
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
      const { userId, deviceId, deviceType, deviceToken } = req.body;
      // Upsert device registration
      const device = await db.userDevice.findOneAndUpdate(
        { userId, deviceId },
        {
          userId,
          deviceId,
          deviceType,
          deviceToken,
          isActive: true,
          lastActive: Date.now(),
        },
        { upsert: true, new: true }
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

  return {
    create,
    createBatch,
    getUserNotifications,
    markAsRead,
    registerDevice,
    updatePreferences,
    getUserPreferences,
    markAllAsRead,
  };
};
export default NotificationsController;
