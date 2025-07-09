// Store
import * as storeRenting from './views/store/rents.store.js';

// Router
import { createRentsRoutes } from './views/router/rents.router.js';

// Views
import CardRent from './views/components/blocks/CardRent.vue';
import GanttChart from './views/components/pages/Gant/GanttChart.vue';
import Rents from './views/components/pages/Rents.vue';
import RentsEdit from './views/components/pages/RentsEdit.vue';

// Функция инициализации для модуля аренды
function initializeRenting(app, store, router, options = {}) {
  const route = options.route || 'Home';

  const routesRenting = createRentsRoutes('', options);

  router.addRoute(route, routesRenting);
  router.addRoute('Backoffice Root', createRentsRoutes('Backoffice', options));

  store.addStore('rents', storeRenting);
}

const ModuleRenting = {
  initialize: initializeRenting,
  views: {
    store: {
      storeRenting,
    },
    router: {
      createRentsRoutes,
    },
    components: {
      // Blocks
      CardRent,
      // Sections
      // Pages
      Rents,
      GanttChart,
      RentsEdit,
    },
  },
};

export {
  // Blocks
  CardRent,
  createRentsRoutes,
  GanttChart,
  initializeRenting,
  // Sections
  // Pages
  Rents,
  RentsEdit,
  storeRenting,
};

export default ModuleRenting;
