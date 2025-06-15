import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import NotificationsController from './controllers/notifications.controller.js';
import NotificationLogModel from './models/notification-log.model.js';
import NotificationPreferenceModel from './models/notification-preference.model.js';
import NotificationModel from './models/notification.model.js';
import UserDeviceModel from './models/user-device.model.js';
import notificationsRoutes from './routes/notifications.routes.js';
import NotificationService from './services/notification.service.js';
const { getInstance } = globalsabac;
function initializeNotifications(app, db, wss, origins, publicPath) {
  // Set up models in the database object
  db.notification = NotificationModel(db);
  db.userDevice = UserDeviceModel(db);
  db.notificationPreference = NotificationPreferenceModel(db);
  db.notificationLog = NotificationLogModel(db);
  const abac = getInstance(db);
  // const notificationPolicies = initNotificationPolicies(abac, db);
  // Set up routes if app is provided
  if (app) {
    notificationsRoutes(app, db, wss, origins, publicPath);
  }
  // Initialize notification service and related background tasks
  const notificationService = NotificationService(db, wss);
  console.log('[DEBUG] WSS in notification init:', wss);
  // Set up a scheduler to process pending notifications
  setInterval(() => {
    notificationService.processPendingNotifications();
  }, 60000); // Every minute
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
