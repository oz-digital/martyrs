import controllerFactory from '../controllers/spots.controller.js';
export default (function (app, db) {
  const controller = controllerFactory(db);
  app.get('/api/spots', controller.read);
  // Get spot by _id
  app.get('/api/spots/get/:_id', controller.readOne);
  // Add organization spot
  app.post('/api/spots/:_id/create', controller.create);
  // Update organization spot
  app.post('/api/spots/:_id/update', controller.update);
  // Delete organization spot
  app.delete('/api/spots/:_id/delete', controller.delete);
});
