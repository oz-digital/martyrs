// Store
import * as storeOrders from './store/orders.js';
import * as storeShopcart from './store/shopcart.js';
import * as storeTestimonials from './store/testimonials.js';
import storeCustomers from './store/customers.store.js';
import storeApplications from './store/applications.js';
// Router
import addRoutes from '@martyrs/src/modules/globals/views/router/addRoutes.js';
import routerOrders from './router/orders.router.js';
import routerCustomers from './router/customers.router.js';
import routerApplications from './router/applications.router.js';
// Views
import OrderCreate from './components/pages/OrderCreate.vue';
import OrderCreateBackoffice from './components/pages/OrderCreateBackoffice.vue';
import Orders from './components/pages/Orders.vue';
import Customers from './components/pages/Customers.vue';
import Applications from './components/pages/Applications.vue';
// import Favorites from './components/pages/Favorites.vue';
// Importing blocks components
import CardOrder from './components/blocks/CardOrder.vue';
import CardOrderItem from './components/blocks/CardOrderItem.vue';
import CardOrderUser from './components/blocks/CardOrderUser.vue';
import CardCustomer from './components/blocks/CardCustomer.vue';
import StatusHistory from './components/blocks/StatusHistory.vue';
// Importing sections components
import AskToLogin from './components/sections/AskToLogin.vue';
import EmptyState from './components/sections/EmptyState.vue';
import FormCustomerDetails from './components/forms/FormCustomerDetails.vue';
import FormDelivery from './components/sections/FormDelivery.vue';
import FormPayment from './components/sections/FormPayment.vue';
import Succes from './components/sections/Succes.vue';
// Importing partials components
import ShopCart from './components/partials/ShopCart.vue';

import { i18nManager } from '@martyrs/src/modules/globals/views/classes/globals.i18n.js';
import locales from './locales/index.js';

// Пример функции инициализации для модуля заказов
function initializeOrders(app, store, router, options = {}) {
  // Регистрируем локализацию для модуля orders
  i18nManager.register('orders', locales);
  const route = options.route || 'Home';
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';
  const routeUsers = options.routeUsers || 'User Profile Root';

  addRoutes(router, {
    parentName: route,
    basePath: 'orders',
    routes: routerOrders,
    routeNamePrefix: '',
    filterConfig: {
      include: ['CreateOrder', 'Order'], // Только создание заказа на корневом уровне
    },
    meta: {
      context: 'root',
    },
  });

  // Backoffice routes
  if (!options.withBackoffice) {
    addRoutes(router, {
      parentName: routeBackoffice,
      basePath: 'orders', // Промежуточный маршрут /backoffice/orders
      routes: routerOrders,
      routeNamePrefix: 'Backoffice',
      filterConfig: {
        include: ['OrdersList', 'AdminCreateOrder', 'Order', 'OrderEdit'], // Специфичные для бэкофиса маршруты
      },
      meta: {
        context: 'backoffice',
      },
    });
  }

  // User routes
  if (!options.withUserRoutes) {
    addRoutes(router, {
      parentName: routeUsers,
      basePath: 'orders', // Промежуточный маршрут /user/orders
      routes: routerOrders,
      routeNamePrefix: 'User',
      filterConfig: {
        include: ['OrdersList', 'Order'], // Специфичные для пользователя маршруты
      },
      meta: {
        context: 'user',
      },
    });
  }

  // Organization routes
  if (!options.withOrganizationRoutes) {
    console.log('Adding organization routes, parentName:', routeOrganizations);
    addRoutes(router, {
      parentName: routeOrganizations,
      basePath: 'orders', // Промежуточный маршрут /organization/orders
      routes: routerOrders,
      routeNamePrefix: 'Organization',
      filterConfig: {
        include: ['OrdersList', 'Order', 'AdminCreateOrder', 'OrderEdit'], // Специфичные для организации маршруты
      },
      meta: {
        context: 'organization',
      },
    });
    console.log('Router routes after adding organization orders:', router.getRoutes().map(r => r.name));
    const orgOrdersList = router.getRoutes().find(r => r.name === 'OrganizationOrdersList');
    console.log('OrganizationOrdersList route details:', orgOrdersList);
    console.log('Route params:', orgOrdersList?.params);
    console.log('Route keys:', orgOrdersList?.keys);
  }

  // Customer routes for backoffice
  if (!options.withBackoffice) {
    addRoutes(router, {
      parentName: routeBackoffice,
      basePath: 'customers',
      routes: routerCustomers,
      routeNamePrefix: 'Backoffice',
      filterConfig: {
        include: ['CustomersList'],
      },
      meta: {
        context: 'backoffice',
      },
    });
  }

  // Customer routes for organizations
  if (!options.withOrganizationRoutes) {
    addRoutes(router, {
      parentName: routeOrganizations,
      basePath: 'customers',
      routes: routerCustomers,
      routeNamePrefix: 'Organization',
      filterConfig: {
        include: ['CustomersList'],
      },
      meta: {
        context: 'organization',
      },
    });
  }

  // Application routes for backoffice
  if (!options.withBackoffice) {
    addRoutes(router, {
      parentName: routeBackoffice,
      basePath: 'applications',
      routes: routerApplications,
      routeNamePrefix: 'Backoffice',
      filterConfig: {
        include: ['Applications'],
      },
      meta: {
        context: 'backoffice',
      },
    });
  }

  // Application routes for organizations
  if (!options.withOrganizationRoutes) {
    addRoutes(router, {
      parentName: routeOrganizations,
      basePath: 'applications',
      routes: routerApplications,
      routeNamePrefix: 'Organization',
      filterConfig: {
        include: ['Applications'],
      },
      meta: {
        context: 'organization',
      },
    });
  }

  store.addStore('orders', storeOrders);
  store.addStore('shopcart', storeShopcart);
  store.addStore('testimonials', storeTestimonials);
  store.addStore('customers', storeCustomers);
  store.addStore('applications', storeApplications);
}

const ModuleOrder = {
  initialize: initializeOrders,
  store: {
    storeOrders,
    storeShopcart,
    storeTestimonials,
    storeCustomers,
    storeApplications,
  },
  router: {
    routerOrders,
    routerCustomers,
    routerApplications,
  },
  components: {
    // Pages
    Orders,
    Customers,
    Applications,
    // Order,
    OrderCreate,
    OrderCreateBackoffice,
    // Favorites,
    // Blocks
    CardOrderItem,
    CardOrder,
    CardOrderUser,
    CardCustomer,
    StatusHistory,
    // Sections
    FormCustomerDetails,
    AskToLogin,
    FormDelivery,
    EmptyState,
    Succes,
    FormPayment,
    // Partials
    ShopCart,
  },
};

export default ModuleOrder;
