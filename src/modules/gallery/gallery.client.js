// Store
import * as storeGallery from './store/gallery.js';

// Router
import routerGallery from './router/gallery.router.js';
// import { createGalleryBackofficeRoutes } from './router/gallery.backoffice.router.js';

// Views
// Pages
import Gallery from './components/pages/Gallery.vue';

// Sections
import BackofficeGallery from './components/sections/BackofficeGallery.vue';

// Пример функции инициализации для модуля галереи
function initializeGallery(app, store, router, options = {}) {
  const route = options.route || 'Home';

  // const routesGallery = createGalleryRoutes();
  // const routesGalleryBackoffice = createGalleryBackofficeRoutes();

  router.addRoute(route, routerGallery);
  // router.addRoute('Backoffice', routesGalleryBackoffice);

  store.addStore('gallery', storeGallery);
}

const ModuleGallery = {
  initialize: initializeGallery,
  views: {
    store: {
      storeGallery,
    },
    router: {
      routerGallery,
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
