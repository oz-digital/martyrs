// Functional imports (needed for initialize function)
import * as storeAuth from './views/store/auth.js';
import * as storeTwofa from './views/store/twofa.js';
import * as storeUsers from './views/store/users.js';

// Router
import routerAuth from './views/router/auth.js';
import routerUsers from './views/router/users.js';

// Middlewares
import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

import { i18nManager }  from '@martyrs/src/modules/globals/views/classes/globals.i18n.js';

import locales from './locales/index.js';

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
  const route = options.route || 'Home';

  i18nManager.register('auth', locales);

  router.addRoute(route, routerAuth);
  router.addRoute(route, routerUsers);

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
      routerAuth,
      routerUsers,
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
  routerAuth,
  routerUsers,
  validationAuth,
  initializeAuth as initialize,
};

export default ModuleAuth;
