// Functional imports (needed for initialize function)
import getBrowserLocale from './views/localization/get-browser-locale.js';
import scrollBehavior from './views/router/scrollBehavior.js';

import * as mixins from './views/mixins/mixins.js';
import * as storeGlobals from './views/store/globals.js';
import * as appRenderer from './views/utils/vue-app-renderer.js';
import './views/utils/polyfills.js'; // Auto-apply polyfills

import alertPlugin from './views/plugins/alert.plugin.js';
import popupAuthPlugin from './views/plugins/popup.auth.plugin.js';
import datePickerPlugin from './views/plugins/date-picker.plugin.js';
import storeDebuggerPlugin from './views/plugins/store-debugger/store-debugger.plugin.js';

import store from './views/classes/store.js';
import websockets from './views/classes/globals.websocket.js';
import { i18nManager }  from '@martyrs/src/modules/globals/views/classes/globals.i18n.js';
import { moduleRegistry } from './views/classes/module-registry.js';

import en from './locales/en.js';
import ru from './locales/ru.js';


// Пример функции инициализации для модуля заказов
function initializeGlobals(app, store, router, config, options = {}) {
  console.log('[initializeGlobals] START');
  console.log('[initializeGlobals] Store before addStore:', store);
  
  const route = options.route || 'Home';

  const locales = {
    en: en,
    ru: ru,
    es: {}  // или es: undefined
  };

  i18nManager.register('globals', locales);

  const envVariables = ['NODE_ENV', 'PORT', 'APP_NAME', 'DOMAIN_URL', 'API_URL', 'WSS_URL', 'FILE_SERVER_URL', 'WDT_TOKEN', 'WDM_URL_PROD', 'GOOGLE_MAPS_API_KEY', 'MOBILE_APP'];

  app.config.globalProperties.DOMAIN_URL = process.env.DOMAIN_URL;
  app.config.globalProperties.API_URL = process.env.API_URL;
  app.config.globalProperties.WSS_URL = process.env.WSS_URL;
  app.config.globalProperties.MOBILE_APP = process.env.MOBILE_APP;
  app.config.globalProperties.FILE_SERVER_URL = process.env.FILE_SERVER_URL;
  app.config.globalProperties.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  app.mixin(mixins.globalMixins);

  app.use(alertPlugin);
  app.use(popupAuthPlugin);
  app.use(datePickerPlugin);
  // app.use(storeDebuggerPlugin, store);


  // WebSocket инициализируется в client.js после гидратации
  // чтобы не блокировать главный поток

  // Change Locale to Route Locale if available
  router.beforeEach((to, from, next) => {
    const locale = to.params.locale;

    if (locale) {
      if (!app.config.globalProperties.$i18n.availableLocales.includes(locale)) {
        return next({ path: '/404' });
      } else {
        app.config.globalProperties.$i18n.locale = locale;
        return next();
      }
    }

    return next();
  });

  if (config && config.modules) storeGlobals.state.options = config.modules;

  console.log('[initializeGlobals] Adding globals store with state:', storeGlobals.state);
  store.addStore('globals', storeGlobals);
  console.log('[initializeGlobals] Store after addStore:', store);
  console.log('[initializeGlobals] Store.globals exists:', !!store.globals);
  console.log('[initializeGlobals] END');

  router.addRoute(route, {
    path: '404',
    name: 'notfound',
    component: () => import('@martyrs/src/modules/globals/views/components/pages/404.vue'),
  });
  router.addRoute(route, {
    path: '401',
    name: 'unauthorized',
    component: () => import('@martyrs/src/modules/globals/views/components/pages/401.vue'),
  });
  router.addRoute(route, {
    path: ':pathMatch(.*)*',
    name: 'NotFound',
    redirect: { name: 'notfound' },
  });
}

const ModuleGlobals = {
  initialize: initializeGlobals,
  views: {
    store: {
      storeGlobals,
    },
    router: {
      // routerOrders
    },
  },
};

// Component re-exports (enables tree shaking)
export { default as layoutApp } from './views/components/layouts/App.vue';
export { default as layoutClient } from './views/components/layouts/Client.vue';
export { default as BlockSearch } from '@martyrs/src/modules/globals/views/components/blocks/BlockSearch.vue';
export { default as BottomNavigationBar } from '@martyrs/src/modules/globals/views/components/partials/BottomNavigationBar.vue';
export { default as Header } from '@martyrs/src/modules/globals/views/components/partials/Header.vue';
export { default as Navigation } from '@martyrs/src/modules/globals/views/components/partials/Navigation.vue';
export { default as NavigationBar } from '@martyrs/src/modules/globals/views/components/partials/NavigationBar.vue';
export { default as Sidebar } from '@martyrs/src/modules/globals/views/components/partials/Sidebar.vue';
export { default as Footer } from '@martyrs/src/modules/globals/views/components/partials/Footer.vue';
export { default as Walkthrough } from '@martyrs/src/modules/globals/views/components/sections/Walkthrough.vue';

// Functional exports
export {
  appRenderer,
  getBrowserLocale,
  mixins,
  moduleRegistry,
  scrollBehavior,
  store,
  i18nManager,
  storeGlobals,
  websockets,
};

// Export client factory
export { createUniversalApp } from './views/classes/globals.app.js';

// Re-export polyfills for documentation
export * from './views/utils/polyfills.js';

export default ModuleGlobals;
