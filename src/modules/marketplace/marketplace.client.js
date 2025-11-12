// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './views/router/marketplace.router.js';

//Store
import * as storeMarketplace from './views/store/marketplace.js';

// Pages
import Marketplace from './views/components/pages/Marketplace.vue';

// Sections
import SectionMenu from './views/components/sections/SectionMenu.vue';

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
      Marketplace,
    },
  },
};

export {
  // Elements
  // Pages
  Marketplace,
  // Blocks
  // Sections
  SectionMenu,
};

export default ModuleMarketplace;
