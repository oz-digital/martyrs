// Store
import * as storeRenting from './views/store/rents.store.js';

// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './rents.router.js';

// Views
import CardRent from './views/components/blocks/CardRent.vue';
import GanttChart from './views/components/pages/Gant/GanttChart.vue';
import Rents from './views/components/pages/Rents.vue';
import RentsEdit from './views/components/pages/RentsEdit.vue';

// Функция инициализации для модуля аренды
function initializeRenting(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('rents', storeRenting);
}

const ModuleRenting = {
  initialize: initializeRenting,
  views: {
    store: {
      storeRenting,
    },
    router: {
      getRoutes,
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
  getRoutes,
  GanttChart,
  initializeRenting,
  // Sections
  // Pages
  Rents,
  RentsEdit,
  storeRenting,
};

export default ModuleRenting;
