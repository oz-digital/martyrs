import notifications from '../controllers/notifications.controller.js';
// routes/notifications.routes.js
const notificationsRoutes = (app, db, wss, origins, publicPath, notificationService) => {
  const controller = notifications(db, wss, notificationService);
  // Get notifications for a user
  app.get('/api/notifications/user/:userId', controller.getUserNotifications);
  // Create a new notification
  app.post('/api/notifications', controller.create);
  // Create multiple notifications at once
  app.post('/api/notifications/batch', controller.createBatch);
  // Mark notification as read
  app.put('/api/notifications/:id/read', controller.markAsRead);
  // Mark all notifications as read for a user
  app.put('/api/notifications/user/:userId/read-all', controller.markAllAsRead);
  // Register a device for push notifications
  app.post('/api/notifications/devices/register', controller.registerDevice);
  // Add this to routes/notifications.routes.js
  app.get('/api/notifications/preferences/:userId', controller.getUserPreferences);
  // Update notification preferences
  app.put('/api/notifications/preferences', controller.updatePreferences);
};
export default notificationsRoutes;
