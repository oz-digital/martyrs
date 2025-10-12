// Store
import * as storeReports from './store/reports.js';

// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './reports.router.js';

// Views
// Предполагаем, что у нас есть компонент для отображения отчетов
// import ReportPage from './components/pages/ReportPage.vue';

// Пример функции инициализации для модуля отчетов
function initializeReports(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('reports', storeReports);
}

const ModuleReports = {
  initialize: initializeReports,
  views: {
    store: {
      storeReports,
    },
    router: {
      getRoutes,
    },
    components: {
      // Pages
      // ReportPage
    },
  },
};

export default ModuleReports;
