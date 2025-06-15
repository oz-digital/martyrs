// Store
import * as storePages from './views/store/pages.js';
// Router
import routerPagesBackoffice from './views/router/pages.backoffice.router.js';
import routerPages from './views/router/pages.router.js';
// Views
import Page from './views/components/pages/Page.vue';
import PageEdit from './views/components/pages/PageEdit.vue';
import Pages from './views/components/pages/Pages.vue';

// Пример функции инициализации для модуля страниц
function initializePages(app, store, router, options = {}) {
  const routeHome = options.route?.home || 'Home';
  const routeBO = options.route?.backoffice || 'Backoffice Root';

  router.addRoute(routeHome, routerPages);
  router.addRoute(routeBO, routerPagesBackoffice);

  store.addStore('pages', storePages);
}

const ModulePages = {
  initialize: initializePages,
  views: {
    store: {
      storePages,
    },
    router: {
      routerPages,
    },
    components: {
      // Pages
      Pages,
      Page,
      PageEdit,
    },
  },
};

export default ModulePages;
