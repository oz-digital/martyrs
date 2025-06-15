import controllerFactory from '../factories/pages.factory.js';
export default (function (app, db, origins, publicPath) {
  const controller = controllerFactory(db);
  app.get('/api/pages/read', controller.read);
  app.post('/api/pages/create', controller.create);
  app.put('/api/pages/update', controller.update);
  app.delete('/api/pages/delete', controller.delete);
});
