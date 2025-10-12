// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './marketplace.router.js';

//Store
import * as storeMarketplace from './views/store/marketplace.js';

// Layouts
import Marketplace from './views/components/layouts/Marketplace.vue';

// Sections
import SectionMenu from './views/components/sections/SectionMenu.vue';

// Pages
import Catalog from './views/components/pages/Catalog.vue';

// Пример функции инициализации для модуля маркетплейса
function initializeMarketplace(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('marketplace', storeMarketplace);
}

const ModuleMarketplace = {
  initialize: initializeMarketplace,
  views: {
    store: {
      storeMarketplace,
    },
    router: {
      getRoutes,
    },
    components: {
      // Elements
      // Blocks
      // Sections
      SectionMenu,
      // Pages
      Catalog,
      // Layouts
      Marketplace,
    },
  },
};

export {
  // Elements
  // Pages
  Catalog,
  // Layouts
  Marketplace,
  // Blocks
  // Sections
  SectionMenu,
};

export default ModuleMarketplace;
