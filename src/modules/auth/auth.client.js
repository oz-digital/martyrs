// [LOADING 36] Auth module import started
performance.mark('loading-36-start');
console.log('[LOADING 36] Auth module import started...');

// Functional imports (needed for initialize function)
import * as storeAuth from './views/store/auth.js';
import * as storeTwofa from './views/store/twofa.js';
import * as storeUsers from './views/store/users.js';

performance.mark('loading-36-stores-end');
const storesTime = performance.measure('loading-36-stores', 'loading-36-start', 'loading-36-stores-end');
console.log(`[LOADING 36] Store imports completed in ${storesTime.duration.toFixed(2)}ms`);

// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './auth.router.js';

// Middlewares
import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

import { i18nManager }  from '@martyrs/src/modules/core/views/classes/i18n.manager.js';

import locales from './locales/index.js';

performance.mark('loading-36-imports-end');
const importsTime = performance.measure('loading-36-imports', 'loading-36-stores-end', 'loading-36-imports-end');
console.log(`[LOADING 36] Router/middleware/locales imports completed in ${importsTime.duration.toFixed(2)}ms`);

// Component re-exports (enables tree shaking)
export { default as Auth } from './views/components/layouts/Auth.vue';
export { default as EnterCode } from './views/components/pages/EnterCode.vue';
export { default as EnterPassword } from './views/components/pages/EnterPassword.vue';
export { default as Invite } from './views/components/pages/Invite.vue';
export { default as Profile } from './views/components/pages/Profile.vue';
export { default as ProfileEdit } from './views/components/pages/ProfileEdit.vue';
export { default as ResetPassword } from './views/components/pages/ResetPassword.vue';
export { default as SignIn } from './views/components/pages/SignIn.vue';
export { default as SignUp } from './views/components/pages/SignUp.vue';
export { default as FeaturedUsers } from './views/components/sections/FeaturedUsers.vue';
export { default as SliderFeatures } from './views/components/sections/SliderFeatures.vue';

// Пример функции инициализации для модуля аутентификации
function initializeAuth(app, store, router, options = {}) {
  i18nManager.register('auth', locales);

  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('auth', storeAuth);
  store.addStore('twofa', storeTwofa);
  store.addStore('users', storeUsers);

  app.provide('store', store);
}

const ModuleAuth = {
  initialize: initializeAuth,
  views: {
    store: {
      storeAuth,
      storeTwofa,
      storeUsers,
    },
    router: {
      getRoutes,
    },
    middlewares: {
      validationAuth,
    },
  },
};

// Functional exports
export {
  storeAuth,
  storeTwofa,
  storeUsers,
  getRoutes,
  validationAuth,
  initializeAuth as initialize,
};

// [LOADING 36] Auth module import completed
performance.mark('loading-36-end');
performance.measure('loading-36-total', 'loading-36-start', 'loading-36-end');
const totalTime = performance.getEntriesByName('loading-36-total')[0];
console.log(`[LOADING 36] Auth module fully imported in ${totalTime?.duration?.toFixed(2)}ms`);

export default ModuleAuth;
