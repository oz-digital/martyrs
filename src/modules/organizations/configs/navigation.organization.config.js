// Import icons
import IconCommunity from '@martyrs/src/modules/icons/entities/IconCommunity.vue';
import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue';
import IconGallery from '@martyrs/src/modules/icons/entities/IconGallery.vue';
import IconGroups from '@martyrs/src/modules/icons/entities/IconGroups.vue';
import IconOrders from '@martyrs/src/modules/icons/entities/IconOrders.vue';
import IconProducts from '@martyrs/src/modules/icons/entities/IconProducts.vue';
import IconLeftovers from '@martyrs/src/modules/icons/entities/IconLeftovers.vue';
import IconDate from '@martyrs/src/modules/icons/entities/IconDate.vue';
import IconPrice from '@martyrs/src/modules/icons/entities/IconPrice.vue';
import IconSettings from '@martyrs/src/modules/icons/entities/IconSettings.vue';
import IconHome from '@martyrs/src/modules/icons/entities/IconHome.vue';

// Import global mixins for access control
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';
const { hasAccess } = useGlobalMixins();

// Organization backoffice navigation configuration
export const navigationItems = [
  {
    category: 'Organization',
    items: [
      {
        title: 'Profile',
        iconComponent: IconHome,
        route: (auth, route) => ({
          name: 'Organization',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'members', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
      {
        title: 'Members',
        iconComponent: IconGroups,
        route: (auth, route) => ({
          name: 'Organization Members',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'members', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
      {
        title: 'Settings',
        iconComponent: IconSettings,
        route: (auth, route) => ({
          name: 'Organization Edit',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'members', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
    ]
  },
  {
    category: 'Shop',
    items: [
      {
        title: 'Products',
        iconComponent: IconProducts,
        route: (auth, route) => ({
          name: 'Organization_Products',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'products', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
      {
        title: 'Categories',
        iconComponent: IconPrice,
        route: (auth, route) => ({
          name: 'Categories',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'products', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
      {
        title: 'Leftovers',
        iconComponent: IconLeftovers,
        route: (auth, route) => ({
          name: 'Leftovers',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'leftovers', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
    ]
  },
  {
    category: 'Orders & Sales',
    items: [
      {
        title: 'Orders',
        iconComponent: IconOrders,
        route: (auth, route) => ({
          name: 'OrganizationOrdersList',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'orders', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
      {
        title: 'Rents',
        iconComponent: IconEvents,
        route: (auth, route) => ({
          name: 'Organization_Rents',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'orders', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
    ]
  },
  {
    category: 'Content',
    items: [
      {
        title: 'Gallery',
        iconComponent: IconGallery,
        route: (auth, route) => ({
          name: 'Backoffice Gallery',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'gallery', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
      {
        title: 'Events',
        iconComponent: IconEvents,
        route: (auth, route) => ({
          name: 'Organization_Events Backoffice',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'events', 
          'read', 
          auth.accesses, 
          auth.access.roles
        )
      },
      // Закомментированные пункты меню из оригинала также можно добавить при необходимости
      // {
      //   title: 'Community',
      //   iconComponent: IconCommunity,
      //   route: (auth, route) => ({
      //     name: 'Backoffice Community',
      //     params: { _id: route.params._id }
      //   }),
      // },
      // {
      //   title: 'Payments',
      //   icon: '💰',
      //   route: (auth, route) => ({
      //     name: 'Payments',
      //     params: { _id: route.params._id }
      //   }),
      // },
    ]
  },
  // Закомментированное меню из оригинала
  // {
  //   category: 'System',
  //   items: [
  //     {
  //       title: 'Organizations',
  //       iconComponent: IconGroups,
  //       route: (auth, route) => ({
  //         name: 'Backoffice Organizations',
  //         params: { _id: route.params._id }
  //       }),
  //     },
  //     {
  //       title: 'Reports',
  //       icon: '📊',
  //       route: (auth, route) => ({
  //         name: 'Backoffice Reports',
  //         params: { _id: route.params._id }
  //       }),
  //     },
  //   ]
  // },
];

export default navigationItems;