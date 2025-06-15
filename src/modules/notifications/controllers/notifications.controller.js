// controllers/notifications.controller.js
const NotificationsController = (db, wss) => {
  // Create a new notification
  const create = async (req, res) => {
    try {
      const notification = await db.notification.create(req.body);
      // Trigger notification sending process
      const notificationService = notification(db, wss);
      notificationService.processNotification(notification);
      return res.status(201).json(notification);
    } catch (err) {
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
      const result = await db.notification.updateMany({ userId: userId, status: 'unread' }, { status: 'read', updatedAt: Date.now() });
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
    getUserNotifications,
    markAsRead,
    registerDevice,
    updatePreferences,
    getUserPreferences,
    markAllAsRead,
  };
};
export default NotificationsController;
