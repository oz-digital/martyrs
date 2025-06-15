import NotificationsLayout from '../components/layouts/NotificationsLayout.vue';
import Notifications from '../components/pages/Notifications.vue';
import NotificationPreferences from '../components/sections/NotificationPreferences.vue';

const nofitications = {
  path: '/notifications',
  component: NotificationsLayout,
  children: [
    {
      path: '',
      name: 'Notifications',
      component: Notifications,
      meta: {
        // requiresAuth: true,
        title: 'Notifications',
      },
    },
    {
      path: 'preferences',
      name: 'NotificationPreferences',
      component: NotificationPreferences,
      meta: {
        // requiresAuth: true,
        title: 'Notification Preferences',
      },
    },
  ],
};

export default nofitications;
