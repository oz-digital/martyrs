// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './backoffice.router.js';

// Views
// Layouts

// Pages
import Dashboard from './components/pages/Dashboard.vue';

// Admin components
// import AdminDashboard from './components/admin/Dashboard.vue';
// import FastOrders from './components/admin/FastOrders.vue';
// import UserEdit from './components/admin/UserEdit.vue';
// import Users from './components/admin/Users.vue';
// import ProductEdit from './components/admin/ProductEdit.vue';
// import Backcalls from './components/admin/Backcalls.vue';

// Partials
import Sidebar from './components/partials/Sidebar.vue';

// Пример функции инициализации для модуля бэкофиса
function initializeBackoffice(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });
}

const ModuleBackoffice = {
  initialize: initializeBackoffice,
  views: {
    router: {
      getRoutes,
    },
    components: {
      // Layouts
      // Pages
      Dashboard,
      // Admin components
      // AdminDashboard,
      // FastOrders,
      // UserEdit,
      // Users,
      // ProductEdit,
      // Backcalls,
      // Partials
      Sidebar,
    },
  },
};

export default ModuleBackoffice;
