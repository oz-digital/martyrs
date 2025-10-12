// Store
import * as storeGallery from './store/gallery.js';

// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './router/gallery.router.js';

// Views
// Pages
import Gallery from './components/pages/Gallery.vue';

// Sections
import BackofficeGallery from './components/sections/BackofficeGallery.vue';

// Пример функции инициализации для модуля галереи
function initializeGallery(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('gallery', storeGallery);
}

const ModuleGallery = {
  initialize: initializeGallery,
  views: {
    store: {
      storeGallery,
    },
    router: {
      getRoutes,
    },
    components: {
      // Pages
      Gallery,
      // Sections
      BackofficeGallery,
    },
  },
};

export default ModuleGallery;
