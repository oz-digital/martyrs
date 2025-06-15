import controllerFactory from '../controllers/reports.controller.js';
export default (function (app, db, origins) {
  const controller = controllerFactory(db);
  // const { authJwt } = middlewareFactoryGlobal(db);
  app.get('/reports', controller.read);
  app.post('/reports', controller.create);
  app.post('/reports', controller.update);
  app.post('/reports', controller.delete);
});
