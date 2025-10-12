import * as storeInitiatives from './views/store/initiatives.js';
import * as storeTasks from './views/store/tasks.js';
import * as storeVotes from './views/store/votes.js';
import * as storeVotings from './views/store/votings.js';

// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes } from './governance.router.js';

// Example initialization function for the Governance module
function initializeGovernance(app, store, router, options = {}) {
  const routes = getRoutes(options);
  routes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('initiatives', storeInitiatives);
  store.addStore('tasks', storeTasks);
  store.addStore('votings', storeVotings);
  store.addStore('votes', storeVotes);
}

const ModuleGovernance = {
  initialize: initializeGovernance,
  views: {
    store: {
      storeInitiatives,
      storeTasks,
      storeVotings,
      storeVotes,
    },
    router: {
      getRoutes,
    },
  },
};

export default ModuleGovernance;
