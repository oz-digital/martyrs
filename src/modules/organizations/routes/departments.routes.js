import controllerFactory from '../controllers/departments.controller.js';
export default (function (app, db) {
  const controller = controllerFactory(db);
  // Standard Store routes
  app.get('/api/departments/read', controller.read);
  app.post('/api/departments/create', controller.create);
  app.put('/api/departments/update', controller.update);
  app.post('/api/departments/delete', controller.delete);
  
  // Legacy routes for backward compatibility (can be removed later)
  app.get('/api/departments/get/:_id', controller.readOne);
});
