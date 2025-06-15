import FactoryPayments from './controllers/factories/payments.factory.js';
import RoutesPayments from './controllers/routes/payments.routes.js';
import RoutesRewards from './controllers/routes/rewards.routes.js';
import ModelPayment from './models/payment.model.js';
import ModelReward from './models/reward.model.js';
import ModelWallet from './models/wallet.model.js';
// Initialization function for setting up the module within the application
function initializePayments(app, db, wss, wdmClient, origins, publicPath) {
  // Setup models in the database object
  db.wallet = ModelWallet(db);
  db.payment = ModelPayment(db);
  db.reward = ModelReward(db);
  // Setup routes if the app object is provided
  if (app) {
    RoutesPayments(app, db, origins, publicPath);
    // RoutesRewards(app, db, wss, wdmClient, origins)
  }
}
export const models = {
  ModelWallet,
  ModelPayment,
  ModelReward,
};
export const routes = {
  RoutesPayments,
  RoutesRewards,
};
export const controllers = {
  FactoryPayments,
};
export { initializePayments as initialize };
export default {
  initialize: initializePayments,
  models,
  routes,
  controllers,
};
