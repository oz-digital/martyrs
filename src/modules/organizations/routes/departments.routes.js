import controllerFactory from '../controllers/departments.controller.js';
export default (function (app, db) {
  const controller = controllerFactory(db);
  // Get organization departments by _id
  app.get('/api/departments/read', controller.read);
  // Get department by _id
  app.get('/api/departments/get/:_id', controller.readOne);
  // Add organization department
  app.post('/api/departments/:_id/create', controller.create);
  // Update organization department
  app.post('/api/departments/:_id/update', controller.update);
  // Delete organization department
  app.delete('/api/departments/:_id/delete', controller.delete);
});
