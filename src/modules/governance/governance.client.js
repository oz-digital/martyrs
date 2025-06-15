import * as storeInitiatives from './views/store/initiatives.js';
import * as storeTasks from './views/store/tasks.js';
import * as storeVotes from './views/store/votes.js';
import * as storeVotings from './views/store/votings.js';

// Router
import { createGovernanceRoutes } from './views/router/goverance.router.js';

// Example initialization function for the Governance module
function initializeGovernance(app, store, router, options = {}) {
  const route = options.route || 'Home';
  const routesGovernance = createGovernanceRoutes('', options);

  router.addRoute(route, routesGovernance);

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
      createGovernanceRoutes,
    },
    // components: {
    //   // Pages
    //   Initiatives,
    //   Initiative,
    //   InitiativeCreate,
    //   Tasks,
    //   Task,
    //   TaskCreate,
    //   Votings,
    //   Voting,
    //   VotingCreate,
    //   // Blocks
    //   CardInitiativeItem,
    //   CardTaskItem,
    //   CardVotingItem,
    //   // Sections
    //   FormInitiativeDetails,
    //   FormTaskDetails,
    //   FormVotingDetails,
    //   VoteForm,
    //   // Partials
    //   RewardDisplay,
    //   VotingResult,
    //   VoteDisplay,
    // }
  },
};

export default ModuleGovernance;
