import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../controllers/orders.controller.js';
export default (function (app, db, origins, publicPath) {
  const controller = controllerFactory(db);
  const middleware = middlewareFactoryAuth(db);
  app.post(
    '/api/orders/create',
    // [
    //   middleware.authJwt.verifyToken
    // ],
    controller.create
  );
  app.get('/api/orders/read', controller.read);
  app.post(
    '/api/orders/update',
    // [
    //   middleware.authJwt.verifyToken
    // ],
    controller.update
  );
  app.post(
    '/api/orders/delete',
    // [
    //   middleware.authJwt.verifyToken
    // ],
    controller.deleteOrder
  );
});
