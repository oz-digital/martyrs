import FactorySpot from './controllers/spots.controller.js';
import ModelSpot from './models/spot.model.js';
import RoutesSpot from './routes/spots.routes.js';
function initializeSpots(app, db, origins, publicPath) {
  // Setup models in the database object
  db.spot = ModelSpot(db);
  // Setup routes if the app object is provided
  if (app) {
    RoutesSpot(app, db, origins, publicPath);
  }
}
export const models = {
  ModelSpot,
};
export const routes = {
  RoutesSpot,
};
export const controllers = {
  FactorySpot,
};
export { initializeSpots as initialize };
export default {
  initialize: initializeSpots,
  models,
  routes,
  controllers,
};
