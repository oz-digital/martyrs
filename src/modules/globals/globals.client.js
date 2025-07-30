// Components
// import Client from "./components/layouts/Client.vue"

import getBrowserLocale from './views/localization/get-browser-locale.js';
import scrollBehavior from './views/router/scrollBehavior.js';

import layoutApp from './views/components/layouts/App.vue';
import layoutClient from './views/components/layouts/Client.vue';

import BlockSearch from '@martyrs/src/modules/globals/views/components/blocks/BlockSearch.vue';

import BottomNavigationBar from '@martyrs/src/modules/globals/views/components/partials/BottomNavigationBar.vue';
import Header from '@martyrs/src/modules/globals/views/components/partials/Header.vue';
import Navigation from '@martyrs/src/modules/globals/views/components/partials/Navigation.vue';
import NavigationBar from '@martyrs/src/modules/globals/views/components/partials/NavigationBar.vue';
import Sidebar from '@martyrs/src/modules/globals/views/components/partials/Sidebar.vue';
import Footer from '@martyrs/src/modules/globals/views/components/partials/Footer.vue';

import Walkthrough from '@martyrs/src/modules/globals/views/components/sections/Walkthrough.vue';

import * as mixins from './views/mixins/mixins.js';
import * as storeGlobals from './views/store/globals.js';
import * as appRenderer from './views/utils/vue-app-renderer.js';

import alertPlugin from './views/plugins/alert.plugin.js';
import popupAuthPlugin from './views/plugins/popup.auth.plugin.js';
import datePickerPlugin from './views/plugins/date-picker.plugin.js';
import storeDebuggerPlugin from './views/plugins/store-debugger/store-debugger.plugin.js';

import store from './views/classes/store.js';
import websockets from './views/classes/globals.websocket.js';
import { i18nManager }  from '@martyrs/src/modules/globals/views/classes/globals.i18n.js';

import en from './locales/en.js';
import ru from './locales/ru.js';


// Пример функции инициализации для модуля заказов
function initializeGlobals(app, store, router, config, options = {}) {
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


    
  // Initialize WebSocket for all users (authenticated and anonymous)
  console.log('Initializing websockets via globals');
  websockets.initialize({
    wsUrl: process.env.WSS_URL,
    maxReconnectAttempts: 10,
    reconnectDelay: 2000,
  });

  // Connect without userId - will work for both authenticated (via cookies) and anonymous users
  websockets.connect();

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

  store.addStore('globals', storeGlobals);

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
    components: {
      // Pages
      BlockSearch,
      layoutClient,
      layoutApp,
      Header,
      Navigation,
      Footer,
      Sidebar,
      BottomNavigationBar,
      NavigationBar,
      Walkthrough
    },
  },
};

export {
  BlockSearch,
  Header,
  Footer,
  Navigation,
  NavigationBar,
  Sidebar,
  Walkthrough,
  appRenderer,
  getBrowserLocale,
  layoutApp,
  // Components
  layoutClient,
  // Client,
  mixins,
  scrollBehavior,
  store,
  i18nManager,
  // Store
  storeGlobals,
  websockets,
};

export default ModuleGlobals;
