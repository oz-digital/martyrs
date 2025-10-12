function buildNotificationRoutes() {
  return [
    {
      path: '',
      name: 'Notifications',
      component: () => import(
        /* webpackChunkName: 'notifications-page' */
        './components/pages/Notifications.vue'
      ),
      meta: {
        title: 'Notifications',
      },
    },
    {
      path: 'preferences',
      name: 'NotificationPreferences',
      component: () => import(
        /* webpackChunkName: 'notifications-preferences' */
        './components/sections/NotificationPreferences.vue'
      ),
      meta: {
        title: 'Notification Preferences',
      },
    },
  ];
}

export function getRoutes(options = {}) {
  const routes = [];
  const routeUsers = options.routeUsers || 'User Profile Root';

  routes.push({
    parentName: routeUsers,
    config: {
      basePath: options.basePath || 'notifications',
      component: options.layoutComponent || (() => import(
        /* webpackChunkName: 'notifications-layout' */
        './components/layouts/NotificationsLayout.vue'
      )),
      routes: buildNotificationRoutes(options),
    },
  });

  return routes;
}

export default { getRoutes };
