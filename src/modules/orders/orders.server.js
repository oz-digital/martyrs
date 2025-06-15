import CRUD from '@martyrs/src/modules/globals/controllers/classes/globals.crud.js';
import FactoryOrder from './controllers/orders.controller.js';
import ModelApplication from './models/application.model.js';
import ModelCustomer from './models/customer.model.js';
import ModelOrder from './models/order.model.js';
import ModelTestimonial from './models/testimonial.model.js';
import RoutesApplications from './routes/applications.routes.js';
import RoutesOrder from './routes/orders.routes.js';
function initializeOrders(app, db, origins, publicPath) {
  // Setup models in the database object
  db.order = ModelOrder(db);
  db.customer = ModelCustomer(db);
  db.testimonial = ModelTestimonial(db);
  db.application = ModelApplication(db);
  // Setup routes if the app object is provided
  if (app) {
    RoutesOrder(app, db, origins, publicPath);
    RoutesApplications(app, db, origins, publicPath);
    new CRUD('/api/customers', app, db, db.customer);
  }
}
export const models = {
  ModelOrder,
  ModelCustomer,
};
export const routes = {
  RoutesOrder,
};
export const controllers = {
  FactoryOrder,
};
export { initializeOrders as initialize };
export default {
  initialize: initializeOrders,
  models,
  routes,
  controllers,
};
