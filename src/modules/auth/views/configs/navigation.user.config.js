// Import icons
import IconHome from '@martyrs/src/modules/icons/entities/IconHome.vue';
import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue';
import IconGroups from '@martyrs/src/modules/icons/entities/IconGroups.vue';
import IconOrders from '@martyrs/src/modules/icons/entities/IconOrders.vue';
import IconBell from '@martyrs/src/modules/icons/entities/IconBell.vue';
import IconSettings from '@martyrs/src/modules/icons/entities/IconSettings.vue';
import IconProfile from '@martyrs/src/modules/icons/entities/IconProfile.vue';

// Import global mixins for access control
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { isModuleInstalled } = useGlobalMixins();

// User profile navigation configuration
export const navigationItems = [
  {
    category: '',
    visible: () => true,
    items: [
      {
        title: 'Dashboard',
        iconComponent: IconHome,
        route: (auth, route) => `/users/${route.params._id}/dashboard`,
        visible: (auth, route) => auth.user && auth.user._id === route.params._id // Only owner
      },
      {
        title: 'Notifications',
        iconComponent: IconBell,
        route: (auth, route) => `/users/${route.params._id}/notifications`,
        visible: (auth, route) => auth.user && auth.user._id === route.params._id
      },
      {
        title: 'Settings',
        iconComponent: IconSettings,
        route: (auth, route) => `/users/${route.params._id}/edit/profile`,
        visible: (auth, route) => auth.user && auth.user._id === route.params._id
      },
    ]
  },
  {
    category: 'Profile',
    visible: () => true,
    items: [
      {
        title: 'Profile',
        iconComponent: IconProfile,
        route: (auth, route) => `/users/${route.params._id}`,
        visible: () => true // Public access
      },
      {
        title: 'Events',
        iconComponent: IconEvents,
        route: (auth, route) => `/users/${route.params._id}/events`,
        visible: () => isModuleInstalled('events')
      },
      {
        title: 'Groups',
        iconComponent: IconGroups,
        route: (auth, route) => `/users/${route.params._id}/organizations`,
        visible: () => isModuleInstalled('organizations')
      },
    ]
  },
  {
    category: 'Orders',
    visible: () => true,
    items: [
      {
        title: 'Orders',
        iconComponent: IconOrders,
        route: (auth, route) => `/users/${route.params._id}/orders`,
        visible: (auth, route) => isModuleInstalled('orders') && (
          auth.user && (
            auth.user._id === route.params._id ||
            (auth.access.roles &&
              (auth.access.roles.includes('ROLE_MODERATOR') ||
               auth.access.roles.includes('ROLE_ADMIN'))
            )
          )
        )
      },
    ]
  },
];

export default navigationItems;
