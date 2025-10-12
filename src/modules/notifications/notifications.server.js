import coreabac from '@martyrs/src/modules/core/controllers/classes/core.abac.js';
import NotificationsController from './controllers/notifications.controller.js';
import NotificationLogModel from './models/notification-log.model.js';
import NotificationPreferenceModel from './models/notification-preference.model.js';
import NotificationModel from './models/notification.model.js';
import UserDeviceModel from './models/user-device.model.js';
import notificationsRoutes from './routes/notifications.routes.js';
import NotificationService from './services/notification.service.js';
const { getInstance } = coreabac;
function initializeNotifications(app, db, wss, origins, publicPath) {
  // Set up models in the database object
  db.notification = NotificationModel(db);
  db.userDevice = UserDeviceModel(db);
  db.notificationPreference = NotificationPreferenceModel(db);
  db.notificationLog = NotificationLogModel(db);
  const abac = getInstance(db);
  // const notificationPolicies = initNotificationPolicies(abac, db);

  // Initialize notification service and related background tasks only if wss is provided
  if (wss) {
    const notificationService = NotificationService(db, wss);
    // Set up routes if app is provided
    if (app) {
      notificationsRoutes(app, db, wss, origins, publicPath, notificationService);
    }
    console.log('[DEBUG] WSS in notification init:', wss);
    // Set up a scheduler to process pending notifications with overlap protection
    let isProcessing = false;

    setInterval(async () => {
      if (isProcessing) return;
      isProcessing = true;

      try {
        await notificationService.processPendingNotifications();
      } catch (error) {
        console.error('Error in processPendingNotifications:', error);
      } finally {
        isProcessing = false;
      }
    }, 10000); // Every 10 seconds
  } else if (app) {
    // Set up routes without notificationService if wss is not available
    notificationsRoutes(app, db, null, origins, publicPath, null);
  }
}
export const models = {
  NotificationModel,
  UserDeviceModel,
  NotificationPreferenceModel,
  NotificationLogModel,
};
export const routes = {
  notificationsRoutes,
};
export const controllers = {
  NotificationsController,
};
export const services = {
  NotificationService,
};
export { initializeNotifications as initialize };
export default {
  initialize: initializeNotifications,
  models,
  routes,
  controllers,
  services,
};
