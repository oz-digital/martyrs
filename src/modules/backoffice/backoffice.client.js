// Router
import routerBackoffice from './router/backoffice.js';

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
  const route = options.route || 'Home';

  // const routesBackoffice = createBackofficeRoutes();
  // const routesAdmin = createAdminRoutes();

  router.addRoute(route, routerBackoffice);
  // router.addRoute(`${route}.admin`, routerBackoffice);
}

const ModuleBackoffice = {
  initialize: initializeBackoffice,
  views: {
    router: {
      routerBackoffice,
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
