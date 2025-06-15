// Router
import routerMarketplace from './views/router/marketplace.router.js';

//Store
import * as storeMarketplace from './views/store/marketplace.js';

// Layouts
import Marketplace from './views/components/layouts/Marketplace.vue';

// Sections
import SectionMenu from './views/components/sections/SectionMenu.vue';

// Pages
import Catalog from './views/components/pages/Catalog.vue';

// Пример функции инициализации для модуля продуктов
function initializeProducts(app, store, router, options = {}) {
  const route = options.route || 'Home';

  router.addRoute(route, routerMarketplace);

  store.addStore('marketplace', storeMarketplace);
}

const ModuleMarketplace = {
  initialize: initializeProducts,
  views: {
    store: {
      storeMarketplace,
    },
    router: {
      routerMarketplace,
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
