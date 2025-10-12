// Store
import * as storePages from './views/store/pages.js';
// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './pages.router.js';
// Views
import Page from './views/components/pages/Page.vue';
import PageEdit from './views/components/pages/PageEdit.vue';
import Pages from './views/components/pages/Pages.vue';

// Пример функции инициализации для модуля страниц
function initializePages(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('pages', storePages);
}

const ModulePages = {
  initialize: initializePages,
  views: {
    store: {
      storePages,
    },
    router: {
      getRoutes,
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
