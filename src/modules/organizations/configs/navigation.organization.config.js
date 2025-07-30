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
import IconAddress from '@martyrs/src/modules/icons/entities/IconAddress.vue';

// Import global mixins for access control
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';

const { hasAccess, isModuleInstalled } = useGlobalMixins();

// Organization backoffice navigation configuration
export const navigationItems = [
  {
    category: 'Organization',
    visible: () => true, // Always visible - has both public and private items
    items: [
      {
        title: 'Profile',
        iconComponent: IconHome,
        route: (auth, route) => ({
          name: 'Organization',
          params: { _id: route.params._id }
        }),
        visible: () => true // Public access
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
          'departments', 
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
    category: 'Discover',
    visible: () => true, // Always visible - public category
    items: [
      {
        title: 'Products',
        iconComponent: IconProducts,
        route: (auth, route) => ({
          name: 'Organization_Products',
          params: { _id: route.params._id }
        }),
        visible: () => isModuleInstalled('products')
      },
      {
        title: 'Events',
        iconComponent: IconEvents,
        route: (auth, route) => ({
          name: 'Organization_Events',
          params: { _id: route.params._id }
        }),
        visible: () => isModuleInstalled('events')
      },
      {
        title: 'Posts',
        iconComponent: IconCommunity,
        route: (auth, route) => ({
          name: 'Organization_Posts',
          params: { _id: route.params._id }
        }),
        visible: () => isModuleInstalled('blogposts')
      },
      {
        title: 'Spots',
        iconComponent: IconAddress,
        route: (auth, route) => ({
          name: 'Organization_Spots',
          params: { _id: route.params._id }
        }),
        visible: () => isModuleInstalled('spots')
      },
      {
        title: 'Gallery',
        iconComponent: IconGallery,
        route: (auth, route) => ({
          name: 'Backoffice Gallery',
          params: { _id: route.params._id }
        }),
        visible: () => isModuleInstalled('gallery')
      },
    ]
  },
  {
    category: 'Management',
    visible: (auth, route) => hasAccess(
      route.params._id, 
      'products', 
      'read', 
      auth.accesses, 
      auth.access.roles
    ),
    items: [
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
        title: 'Inventory',
        iconComponent: IconLeftovers,
        route: (auth, route) => ({
          name: 'OrganizationInventoryList',
          params: { _id: route.params._id }
        }),
        visible: (auth, route) => hasAccess(
          route.params._id, 
          'inventory', 
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
        visible: (auth, route) => isModuleInstalled('events') && hasAccess(
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
    category: 'Orders & Sales',
    visible: (auth, route) => hasAccess(
      route.params._id, 
      'orders', 
      'read', 
      auth.accesses, 
      auth.access.roles
    ),
    items: [
      {
        title: 'Orders',
        iconComponent: IconOrders,
        route: (auth, route) => ({
          name: 'OrganizationOrdersList',
          params: { _id: route.params._id }
        })
      },
      {
        title: 'Customers',
        iconComponent: IconCommunity,
        route: (auth, route) => ({
          name: 'OrganizationCustomers',
          params: { _id: route.params._id }
        })
      },
      {
        title: 'Applications',
        iconComponent: IconOrders,
        route: (auth, route) => ({
          name: 'OrganizationApplications',
          params: { _id: route.params._id }
        })
      },
    ]
  },
];

export default navigationItems;