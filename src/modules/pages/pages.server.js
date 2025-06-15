import FactoryPage from './controllers/factories/pages.factory.js';
import RoutesPage from './controllers/routes/pages.routes.js';
import ModelPage from './models/page.model.js';
function initializePages(app, db, origins, publicPath) {
  // Setup models in the database object
  db.page = ModelPage(db);
  // Setup routes if the app object is provided
  if (app) {
    RoutesPage(app, db, origins, publicPath);
  }
}
export const models = {
  ModelPage,
};
export const routes = {
  RoutesPage,
};
export const controllers = {
  FactoryPage,
};
export { initializePages as initialize };
export default {
  initialize: initializePages,
  models,
  routes,
  controllers,
};
