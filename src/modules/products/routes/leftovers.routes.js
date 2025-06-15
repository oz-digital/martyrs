import controllerFactory from '../controllers/leftovers.controller.js';
export default (function (app, db) {
  const controller = controllerFactory(db);

  app.get('/leftovers', controller.read);
  
  app.get('/leftovers/:_id', controller.get);

  app.post('/leftovers/:_id', controller.update);

  app.post('/leftovers', controller.create);

  app.delete('/leftovers/:_id', controller.delete);

});
