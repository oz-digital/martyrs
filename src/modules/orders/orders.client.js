// Store
import * as storeOrders from './store/orders.js';
import * as storeShopcart from './store/shopcart.js';
import * as storeTestimonials from './store/testimonials.js';
// Router
import addRoutes from '@martyrs/src/modules/globals/views/router/addRoutes.js';
import routerOrders from './router/orders.router.js';
// Views
import OrderCreate from './components/pages/OrderCreate.vue';
import OrderCreateBackoffice from './components/pages/OrderCreateBackoffice.vue';
import Orders from './components/pages/Orders.vue';
// import Favorites from './components/pages/Favorites.vue';
// Importing blocks components
import CardOrder from './components/blocks/CardOrder.vue';
import CardOrderItem from './components/blocks/CardOrderItem.vue';
import CardOrderUser from './components/blocks/CardOrderUser.vue';
import StatusHistory from './components/blocks/StatusHistory.vue';
// Importing sections components
import AskToLogin from './components/sections/AskToLogin.vue';
import EmptyState from './components/sections/EmptyState.vue';
import FormCustomerDetails from './components/sections/FormCustomerDetails.vue';
import FormDelivery from './components/sections/FormDelivery.vue';
import FormPayment from './components/sections/FormPayment.vue';
import Succes from './components/sections/Succes.vue';
// Importing partials components
import ShopCart from './components/partials/ShopCart.vue';

// Пример функции инициализации для модуля заказов
function initializeOrders(app, store, router, options = {}) {
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
  }

  store.addStore('orders', storeOrders);
  store.addStore('shopcart', storeShopcart);
  store.addStore('testimonials', storeTestimonials);
}

const ModuleOrder = {
  initialize: initializeOrders,
  views: {
    store: {
      storeOrders,
      storeShopcart,
      storeTestimonials,
    },
    router: {
      routerOrders,
    },
    components: {
      // Pages
      Orders,
      // Order,
      OrderCreate,
      OrderCreateBackoffice,
      // Favorites,
      // Blocks
      CardOrderItem,
      CardOrder,
      CardOrderUser,
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
  },
};

export default ModuleOrder;
