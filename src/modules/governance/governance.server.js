import FactoryInitiative from './controllers/factories/initiatives.controller.js';
import FactoryTask from './controllers/factories/tasks.controller.js';
import FactoryVote from './controllers/factories/votes.controller.js';
import FactoryVoting from './controllers/factories/votings.controller.js';
import RoutesInitiative from './controllers/routes/initiatives.routes.js';
import RoutesTask from './controllers/routes/tasks.routes.js';
import RoutesVote from './controllers/routes/votes.routes.js';
import RoutesVoting from './controllers/routes/votings.routes.js';
import ModelInitiative from './models/initiative.model.js';
import ModelTask from './models/task.model.js';
import ModelVote from './models/vote.model.js';
import ModelVoting from './models/voting.model.js';
function initializeGovernance(app, db, origins, publicPath) {
  // Setup models in the database object
  db.initiative = ModelInitiative(db);
  db.task = ModelTask(db);
  db.voting = ModelVoting(db);
  db.vote = ModelVote(db);
  // Setup routes if the app object is provided
  if (app) {
    RoutesInitiative(app, db, origins, publicPath);
    RoutesTask(app, db, origins, publicPath);
    RoutesVoting(app, db, origins, publicPath);
    RoutesVote(app, db, origins, publicPath);
  }
}
export const models = {
  ModelInitiative,
  ModelTask,
  ModelVoting,
  ModelVote,
};
export const routes = {
  RoutesInitiative,
  RoutesTask,
  RoutesVoting,
  RoutesVote,
};
export const controllers = {
  FactoryInitiative,
  FactoryTask,
  FactoryVoting,
  FactoryVote,
};
export { initializeGovernance as initialize };
export default {
  initialize: initializeGovernance,
  models,
  routes,
  controllers,
};
