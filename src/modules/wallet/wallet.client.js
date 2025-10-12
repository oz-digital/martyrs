// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './wallet.router.js';

// Example initialization function for the Wallet module
function initializeWallet(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });
}

const ModuleWallet = {
  initialize: initializeWallet,
  views: {
    router: {
      getRoutes,
    },
  },
};

export default ModuleWallet;
