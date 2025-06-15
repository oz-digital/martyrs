// middlewares/notifications.abac.js
const initNotificationPolicies = (abac, db) => {
  // Policy for creating notifications
  abac.allow('createNotification', (user, data) => {
    // Only admins or service accounts can create notifications
    return user.role === 'admin' || user.role === 'service';
  });
  // Policy for reading notifications
  abac.allow('readNotifications', (user, data) => {
    // Users can only read their own notifications
    return user._id.toString() === data.userId.toString();
  });
  // Policy for updating notification preferences
  abac.allow('updateNotificationPreferences', (user, data) => {
    // Users can only update their own preferences
    return user._id.toString() === data.userId.toString();
  });
  return abac;
};
export default initNotificationPolicies;
