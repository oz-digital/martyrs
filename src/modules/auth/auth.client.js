// Store
import * as storeAuth from './views/store/auth.js';
import * as storeTwofa from './views/store/twofa.js';
import * as storeUsers from './views/store/users.js';

// Router
import routerAuth from './views/router/auth.js';
import routerUsers from './views/router/users.js';

// Middlewares
import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

// Views
import Auth from './views/components/layouts/Auth.vue';
import EnterCode from './views/components/pages/EnterCode.vue';
import EnterPassword from './views/components/pages/EnterPassword.vue';
import Invite from './views/components/pages/Invite.vue';
import Profile from './views/components/pages/Profile.vue';
import ProfileEdit from './views/components/pages/ProfileEdit.vue';
import ResetPassword from './views/components/pages/ResetPassword.vue';
import SignIn from './views/components/pages/SignIn.vue';
import SignUp from './views/components/pages/SignUp.vue';

// Importing sections components
import FeaturedUsers from './views/components/sections/FeaturedUsers.vue';
import SliderFeatures from './views/components/sections/SliderFeatures.vue';

// Пример функции инициализации для модуля аутентификации
function initializeAuth(app, store, router, options = {}) {
  const route = options.route || 'Home';

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
    components: {
      // Layout
      Auth,
      // Pages
      EnterCode,
      Invite,
      EnterPassword,
      ResetPassword,
      SignUp,
      SignIn,
      Profile,
      ProfileEdit,
      // Sections
      SliderFeatures,
      FeaturedUsers,
    },
  },
};

export default ModuleAuth;
